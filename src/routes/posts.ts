import { App } from "@tinyhttp/app";
import bodyParser from "body-parser";

import DBHandler from "../lib/DBHandler.js";
import { handleE } from "../lib/utils.js";
import messages from "../lib/messages.js";

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
		return await res.status(200).json({ code: 200, posts: allPosts.posts });
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
		await handleE(e, "ERR CP20 (in POST /posts)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "CP20_21",
		});
		/* c8 ignore stop */
	}
});

router.get("/:slug", async (req, res) => {
	try {
		const post = await DBHandler.posts.fetchPost(req.params.slug);

		if (post.code == 404) {
			return await res
				.status(404)
				.json({ code: 404, message: messages[404][1] });
		}

		if (post.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "FP509_36" });
		}

		/* c8 ignore start */
		return await res.status(200).json({ code: 200, post: post.post });
	} catch (e) {
		await handleE(e, "ERR FP21 (in GET /posts/:slug)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "FP21_25",
		});
		/* c8 ignore stop */
	}
});

router.patch("/:slug", async (req, res) => {
	try {
		const post = {
			title: req.body.title,
			author: req.body.author,
			datetime: req.body.datetime,
			feature_img: req.body.feature_img,
			content: req.body.content,
		};

		const postEdited = await DBHandler.posts.editPost(req.params.slug, post);

		if (postEdited.code == 404) {
			return await res
				.status(404)
				.json({ code: 404, message: messages[404][1] });
		}

		if (postEdited.code == 500) {
			return await res.status(500).json({
				code: 500,
				message: messages[500],
				error: "EP510_27",
			});
		}

		/* c8 ignore start */
		return await res.status(200).json({ code: 200, message: messages[200][3] });
	} catch (e) {
		await handleE(e, "ERR EP22 (in PATCH /posts/:slug)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "EP22_25",
		});
		/* c8 ignore stop */
	}
});

router.delete("/:slug", async (req, res) => {
	try {
		const postDeleted = await DBHandler.posts.deletePost(req.params.slug);

		if (postDeleted.code == 404) {
			return await res
				.status(404)
				.json({ code: 404, message: messages[404][1] });
		}

		if (postDeleted.code == 500) {
			return await res.status(500).json({
				code: 500,
				message: messages[500],
				error: "DP511_27",
			});
		}

		/* c8 ignore start */
		return await res.status(200).json({ code: 200, message: messages[200][4] });
	} catch (e) {
		await handleE(e, "ERR DP23 (in PATCH /posts/:slug)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "DP23_25",
		});
		/* c8 ignore stop */
	}
});

export default router;
