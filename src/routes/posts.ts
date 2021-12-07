import { App } from "@tinyhttp/app";
import bodyParser from "body-parser";

import DBHandler from "../lib/DBHandler.js";
import { handleE } from "../lib/utils.js";
import messages from "../lib/messages.js";
import { EditData, User } from "../lib/types.js";

const router = new App();

router.use(bodyParser.json());

router.get("/", async (_, res) => {
	try {
		const allPosts = await DBHandler.posts.listAll();

		if (allPosts.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "LA507_25" });
		}

		/* c8 ignore start */
		return await res.status(200).json(allPosts);
	} catch (e) {
		await handleE(e, "ERR GP19 (in GET /posts)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "GP19_33",
		});
		/* c8 ignore stop */
	}
});

router.post("/", async (req, res) => {
	try {
		if (
			!req.body.title ||
			!req.body.author ||
			!req.body.datetime ||
			!req.body.feature_img ||
			!req.body.content
		) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][0] });
		}

		const slug = `${req.body.title} ${Math.floor(Math.random() * 10e5) + 1}`
			.toLowerCase()
			.replace(/[^\w ]+/g, "")
			.replace(/ +/g, "-");

		const postCreated = await DBHandler.posts.createPost(slug, {
			title: req.body.title,
			author: req.body.author,
			datetime: req.body.datetime,
			feature_img: req.body.feature_img,
			content: req.body.content,
		});

		if (postCreated.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "CP508_32" });
		}

		/* c8 ignore start */
		return await res.status(201).json({ code: 201, message: messages[201][1] });
	} catch (e) {
		await handleE(e, "ERR CP20 (in POST /posts");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "CP20_21",
		});
		/* c8 ignore stop */
	}
});

export default router;
