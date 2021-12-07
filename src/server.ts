import app from "./app.js";
import { initJobs } from "./lib/utils.js";

initJobs();

const server = app.listen(3000, () => {
	console.log("Listening on http://localhost:3000/");
});
