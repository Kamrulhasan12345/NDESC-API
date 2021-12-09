import app from "./app.js";

import { handleE, initJobs } from "./lib/utils.js";
import { users, posts, db } from "./lib/initDB.js";

initJobs();

const server = app.listen(3000, () => {
	console.log("Listening on http://localhost:3000/");
});

process.on("exit", shutDown);
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
process.on("uncaughtException", async (e) => {
	await handleE(e, "uncaughtException");
});
process.on("uncaughtException", async (e) => {
	await handleE(e, "uncaughtException");
});

let connections = [];

server.on("connection", (connection) => {
	connections.push(connection);
	connection.on(
		"close",
		() => (connections = connections.filter((curr) => curr !== connection))
	);
});

function shutDown() {
	console.log("\nReceived kill signal, shutting down gracefully");
	users.off();
	posts.off();
	db.goOffline();
	server.close(() => {
		console.log("Closed out remaining connections");
		process.exit(0);
	});

	setTimeout(() => {
		console.error(
			"Could not close connections in time, forcefully shutting down"
		);
		process.exit(1);
	}, 10000);

	connections.forEach((curr) => curr.end());
	setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
}
