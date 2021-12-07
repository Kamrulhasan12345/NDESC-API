import { App } from "@tinyhttp/app";

import usersRoute from "./routes/users.js";
import postsRoute from "./routes/posts.js";

const app = new App();

app.use("/users/", usersRoute);

app.use("/posts/", postsRoute);

app.get("/", async (_, res) => {
	res.status(200).json({ message: "It is the Home Route" });
});

export default app;
