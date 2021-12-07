import { App } from "@tinyhttp/app";
import bodyParser from "body-parser";

import DBHandler from "../lib/DBHandler.js";
import { handleE } from "../lib/utils.js";
import messages from "../lib/messages.js";
import { EditData, User } from "../lib/types.js";

const router = new App();

router.use(bodyParser.json());

router.post("/signup", async (req, res) => {
	try {
		if (
			!req.body.refcode ||
			!req.body.username ||
			!req.body.first_name ||
			!req.body.last_name ||
			!req.body.email ||
			!req.body.password ||
			!req.body.col_no ||
			!req.body.avatar
		) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][0] });
		}

		const refCodeExists = await DBHandler.refDB.match(req.body.refcode);
		if (!refCodeExists) {
			return await res
				.status(401)
				.json({ code: 401, message: messages[401][0] });
		}
		// first check if user exists
		const user = Object.assign(req.body) as User;
		const userRegistered = await DBHandler.users.registerUser(user);
		if (userRegistered.code == 400) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][1] });
		}
		if (userRegistered.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "RU502_46" });
		}
		/* c8 ignore start */
		return await res.status(201).json({ code: 201, message: messages[201][0] });
	} catch (e) {
		await handleE(e, "ERR SU14 (in POST /users/signup)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "SU14_45",
		});
		/* c8 ignore stop */
	}
});

router.post("/login", async (req, res) => {
	try {
		if (!req.body.username || !req.body.password) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][0] });
		}
		const userLogged = await DBHandler.users.loginUser(
			req.body.username,
			req.body.password
		);

		if (userLogged.code == 404) {
			return await res
				.status(404)
				.json({ code: 404, message: messages[404][0] });
		}

		if (userLogged.code == 403) {
			return await res
				.status(403)
				.json({ code: 403, message: messages[403][0] });
		}

		if (userLogged.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "LU503_41" });
		}

		/* c8 ignore start */
		return await res.status(200).json(userLogged);
	} catch (e) {
		await handleE(e, "ERR LO15 (in POST /users/login)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "LO15_33",
		});
		/* c8 ignore stop */
	}
});

router.put("/logout", async (req, res) => {
	try {
		if (!req.body.username && !req.body.sessionkey) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][0] });
		}

		const userLoggedOut = await DBHandler.users.logoutUser(
			req.body.username,
			req.body.sessionkey
		);

		if (userLoggedOut.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "LT505_42" });
		}

		/* c8 ignore start */
		return await res.status(200).json({ code: 200, message: messages[200][0] });
	} catch (e) {
		await handleE(e, "ERR LG17 (in PUT /users/logout)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "LG17_27",
		});
		/* c8 ignore stop */
	}
});

router.patch("/edit", async (req, res) => {
	try {
		if (!req.body.username || !req.body.oldPassword) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][0] });
		}

		const user: EditData = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password: req.body.password,
			col_no: req.body.col_no,
			avatar: req.body.avatar,
		};
		const userEdited = await DBHandler.users.editUser(
			user,
			req.body.username,
			req.body.oldPassword
		);

		if (userEdited.code == 404) {
			return await res
				.status(404)
				.json({ code: 404, message: messages[404][0] });
		}

		if (userEdited.code == 403) {
			return await res
				.status(403)
				.json({ code: 403, message: messages[403][0] });
		}

		if (userEdited.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "EU506_37" });
		}

		/* c8 ignore start */
		return await res.status(200).json({ code: 200, message: messages[200][1] });
	} catch (e) {
		await handleE(e, "ERR ED18 (in PATCH /users/edit)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "ED18_18",
		});
		/* c8 ignore stop */
	}
});

router.delete("/delete", async (req, res) => {
	try {
		if (!req.body.username || !req.body.password) {
			return await res
				.status(400)
				.json({ code: 400, message: messages[400][0] });
		}
		const userDeleted = await DBHandler.users.deleteUser(
			req.body.username,
			req.body.password
		);

		if (userDeleted.code == 404) {
			return await res
				.status(404)
				.json({ code: 404, message: messages[404][0] });
		}

		if (userDeleted.code == 403) {
			return await res
				.status(403)
				.json({ code: 403, message: messages[403][0] });
		}

		if (userDeleted.code == 500) {
			return await res
				.status(500)
				.json({ code: 500, message: messages[500], error: "DU504_34" });
		}

		/* c8 ignore start */
		return await res.status(200).json(userDeleted);
	} catch (e) {
		await handleE(e, "ERR DE16 (in DELETE /users/delete)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "DE16_16",
		});
		/* c8 ignore stop */
	}
});

router.get("/un/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const user = await DBHandler.users.fetchUser(username);
		if (user.code == 404) {
			return await res.status(404).json({ ...user, message: messages[404] });
		} else if (user.code == 500) {
			return await res.status(500).json({
				...user,
				message: messages[500],
				error: "FU501_33",
			});
		}
		/* c8 ignore start */
		return await res.status(200).json(user);
	} catch (e) {
		await handleE(e, "ERR UN12 (in GET /users/un/:username)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "UN12_38",
		});
		/* c8 ignore stop */
	}
});

router.get("/sk/:sessionkey", async (req, res) => {
	try {
		const sessionkey = req.params.sessionkey;
		const user = await DBHandler.users.fetchUser(undefined, sessionkey);
		if (user.code == 404) {
			return await res.status(404).json({ ...user, message: messages[404] });
		} else if (user.code == 500) {
			return await res.status(500).json({
				...user,
				message: messages[500],
				error: "FU501_33",
			});
		}
		/* c8 ignore start */
		return await res.status(200).json(user);
	} catch (e) {
		await handleE(e, "ERR SK13 (in GET /users/sk/:sessionkey)");
		return await res.status(500).json({
			code: 500,
			message: messages[500],
			error: "SK13_34",
		});
		/* c8 ignore stop */
	}
});

export default router;
