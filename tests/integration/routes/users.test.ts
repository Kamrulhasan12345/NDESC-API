import assert from "assert";
import sinon, { SinonStub } from "sinon";
import { makeFetch } from "supertest-fetch";

import { describe } from "../../helpers/describe.js";
import router from "../../../src/routes/users.js";
import { db, users } from "../../../src/lib/initDB.js";
import messages from "../../../src/lib/messages.js";
import {
	userValues,
	data,
	invalidData,
	userRefData,
	aUser,
	invalidRefData,
	rawPass,
	editedUser,
} from "../../helpers/variables.js";
import Mail from "nodemailer/lib/mailer/index.js";
import { initJobs } from "../../../src/lib/utils.js";

const fetch = makeFetch(router.listen(0));

describe("POST /users/signup", (it) => {
	initJobs();

	let UserChild: SinonStub;
	let UserOnce: SinonStub;
	let UserSet: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").resolves(invalidData);
		UserSet = sinon.stub(users, "update");
	});

	it.after.each(
		() => (UserChild.restore(), UserOnce.restore(), UserSet.restore())
	);

	it("is returning code 201 on successful registry", async () => {
		await fetch("/signup", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refcode: "testcode", ...aUser.user }),
		}).expect(201, { code: 201, message: messages[201][0] });
	});

	it("is returning code 400 on not providing enough informations", async () => {
		await fetch("/signup", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		}).expect(400, { code: 400, message: messages[400][0] });
	});

	it("s returning code 401 if reference code doesn't exist", async () => {
		await fetch("/signup", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refcode: "invalidKey", ...aUser.user }),
		}).expect(401, { code: 401, message: messages[401][0] });
	});

	it("is returning code 400 if user already exists", async () => {
		UserOnce.resolves(data);

		await fetch("/signup", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refcode: "testcode", ...aUser.user }),
		}).expect(400, { code: 400, message: messages[400][1] });
	});

	it("is returning code 500 with specific error code if there was error in registerUser() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		await fetch("/signup", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refcode: "testcode", ...aUser.user }),
		}).expect(500, { code: 500, message: messages[500], error: "RU502_46" });
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("POST /users/login", (it) => {
	initJobs();

	let UserChild: SinonStub;
	let UserOnce: SinonStub;
	let UserSet: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").resolves(data);
		UserSet = sinon.stub(users, "update");
	});

	it.after.each(
		() => (UserChild.restore(), UserOnce.restore(), UserSet.restore())
	);

	it("is returning code 200 and sessionkey on successful login", async () => {
		const response = await fetch("/login", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: rawPass,
			}),
		}).expect(200);
		const body = await response.text();
		assert(body.includes("code"));
		assert(body.includes("sessionkey"));
	});

	it("is returning code 400 on not providing enough informations", async () => {
		await fetch("/login", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		}).expect(400, { code: 400, message: messages[400][0] });
	});

	it("is returning 404 if the user doesn't exist", async () => {
		UserOnce.resolves(invalidData);

		await fetch("/login", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: rawPass,
			}),
		}).expect(404, { code: 404, message: messages[404][0] });
	});

	it("is returning 403 if password doesn't match", async () => {
		await fetch("/login", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: "invalidPass",
			}),
		}).expect(403, { code: 403, message: messages[403][0] });
	});

	it("is returning code 500 with specific error code if there was error in loginUser() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		await fetch("/login", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: rawPass,
			}),
		}).expect(500, { code: 500, message: messages[500], error: "LU503_41" });
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("PUT /users/logout", (it) => {
	initJobs();

	let UserChild: SinonStub;
	let UserOrderChild: SinonStub;
	let UserEqualTo: SinonStub;
	let UserOnce: SinonStub;
	let UserRemove: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOrderChild = sinon.stub(users, "orderByChild").returns(users);
		UserEqualTo = sinon.stub(users, "equalTo").returns(users);
		UserOnce = sinon.stub(users, "once").returns(Promise.resolve(data));
		UserRemove = sinon.stub(users, "remove");
	});

	it.after.each(
		() => (
			UserChild.restore(),
			UserOrderChild.restore(),
			UserEqualTo.restore(),
			UserOnce.restore(),
			UserRemove.restore()
		)
	);

	it("is returning code 200 if only username is passed", async () => {
		await fetch("/logout", {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username: aUser.user.username }),
		}).expect(200, { code: 200, message: messages[200][0] });
	});

	it("is returning code 200 if only username is passed", async () => {
		await fetch("/logout", {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ sessionkey: "asessionkey" }),
		}).expect(200, { code: 200, message: messages[200][0] });
	});

	it("is returning code 400 if no username or sessionkey is provided", async () => {
		await fetch("/logout", {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		}).expect(400, { code: 400, message: messages[400][0] });
	});

	it("is returning code 500 with specific error code if there was error in logoutUser() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserRemove.rejects();
		await fetch("/logout", {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username: aUser.user.username }),
		}).expect(500, { code: 500, message: messages[500], error: "LT505_42" });
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("PATCH /users/edit", (it) => {
	initJobs();

	let UserChild: SinonStub;
	let UserOnce: SinonStub;
	let UserUpdate: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").resolves(data);
		UserUpdate = sinon.stub(users, "update");
	});

	it.after.each(
		() => (UserChild.restore(), UserOnce.restore(), UserUpdate.restore())
	);

	it("is returning code 200 on successfully editing user informations", async () => {
		await fetch("/edit", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...editedUser,
				username: aUser.user.username,
				oldPassword: rawPass,
			}),
		}).expect(200, { code: 200, message: messages[200][1] });
	});

	it("is returning code 400 on not providing enough informations", async () => {
		await fetch("/edit", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		}).expect(400, { code: 400, message: messages[400][0] });
	});

	it("is returning code 404 if user doesn't exist", async () => {
		UserOnce.resolves(invalidData);

		await fetch("/edit", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...editedUser,
				username: aUser.user.username,
				oldPassword: rawPass,
			}),
		}).expect(404, { code: 404, message: messages[404][0] });
	});

	it("is returning code 403 if password doesn't match", async () => {
		await fetch("/edit", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...editedUser,
				username: aUser.user.username,
				oldPassword: "invalidPass",
			}),
		}).expect(403, { code: 403, message: messages[403][0] });
	});

	it("is returning code 500 with specific error code if there was error in loginUser() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		await fetch("/edit", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...editedUser,
				username: aUser.user.username,
				oldPassword: rawPass,
			}),
		}).expect(500, { code: 500, message: messages[500], error: "EU506_37" });
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("DELETE /users/delete", (it) => {
	initJobs();

	let UserChild: SinonStub;
	let UserOnce: SinonStub;
	let UserRemove: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").resolves(data);
		UserRemove = sinon.stub(users, "remove");
	});

	it.after.each(
		() => (UserChild.restore(), UserOnce.restore(), UserRemove.restore())
	);

	it("is returning code 200 on successful deletion", async () => {
		await fetch("/delete", {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: rawPass,
			}),
		}).expect(200, { code: 200, message: messages[200][2] });
	});

	it("is returning code 400 on not providing enough informations", async () => {
		await fetch("/delete", {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		}).expect(400, { code: 400, message: messages[400][0] });
	});

	it("is returning 404 if the user doesn't exist", async () => {
		UserOnce.resolves(invalidData);

		await fetch("/delete", {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: rawPass,
			}),
		}).expect(404, { code: 404, message: messages[404][0] });
	});

	it("is returning 403 if password doesn't match", async () => {
		await fetch("/delete", {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: "invalidPass",
			}),
		}).expect(403, { code: 403, message: messages[403][0] });
	});

	it("is returning code 500 with specific error code if there was error in loginUser() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		await fetch("/delete", {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: aUser.user.username,
				password: rawPass,
			}),
		}).expect(500, { code: 500, message: messages[500], error: "DU504_34" });
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("GET /users/un/:username", (it) => {
	// db.goOnline();

	let UserChild: SinonStub;
	let UserOnce: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").resolves(data);
	});

	it.after.each(() => (UserChild.restore(), UserOnce.restore()));

	it("is returning correct data", async () => {
		await fetch("/un/" + userValues.username).expect(200, aUser);
	});

	it("is returning user not found in some cases", async () => {
		UserOnce.resolves(invalidData);
		await fetch("/un/auser").expect(404, {
			code: 404,
			message: messages[404][0],
		});
	});

	it("is returning 500 in some cases", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		await fetch("/un/auser").expect(500, {
			code: 500,
			message: messages[500],
			error: "FU501_33",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});

	db.goOffline();
});

describe("GET /users/sk/:sessionkey", (it) => {
	db.goOnline();

	let UserOnce: SinonStub;
	let UserOrderChild: SinonStub;
	let UserEqualTo: SinonStub;

	it.before.each(() => {
		UserOnce = sinon.stub(users, "once").resolves(userRefData);
		UserOrderChild = sinon.stub(users, "orderByChild").returns(users);
		UserEqualTo = sinon.stub(users, "equalTo").returns(users);
	});

	it.after.each(
		() => (UserOrderChild.restore(), UserEqualTo.restore(), UserOnce.restore())
	);

	it("is returning correct data", async () => {
		await fetch("/sk/" + userValues.sessionkey).expect(200, aUser);
	});

	it("is returning user not found in some cases", async () => {
		UserOnce.resolves(invalidRefData);
		await fetch("/sk/akey").expect(404, {
			code: 404,
			message: messages[404][0],
		});
	});

	it("is returning 500 in function fetchUser error cases", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		await fetch("/sk/akey").expect(500, {
			code: 500,
			message: messages[500],
			error: "FU501_33",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
		// log();
		// process.exit(0);
	});

	db.goOffline();
});
