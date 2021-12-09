import { App } from "@tinyhttp/app";
import { rateLimit } from "@tinyhttp/rate-limit";

import usersRoute from "./routes/users.js";
import postsRoute from "./routes/posts.js";

const app = new App();

app.use("/users/", usersRoute);

app.use("/posts/", postsRoute);

app.get("/", async (_, res) => {
	res.status(200).json({ message: "It is the Home Route" });
});

app.put(
	"/ref",
	rateLimit({ max: 2, windowMs: 60 * 5000 /* 5 minute */ }),
	async (req, res) => {
		//
	}
);

export default app;
