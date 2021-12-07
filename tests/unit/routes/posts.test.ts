import assert from "assert";
import sinon, { SinonStub } from "sinon";
import { makeFetch } from "supertest-fetch";

import { describe } from "../../helpers/describe.js";
import router from "../../../src/routes/posts.js";
import { db, posts } from "../../../src/lib/initDB.js";
import messages from "../../../src/lib/messages.js";
import {
	postData,
	postsCompiled,
	postsRefData,
} from "../../helpers/variables.js";
import Mail from "nodemailer/lib/mailer/index.js";
import { initJobs } from "../../../src/lib/utils.js";

const fetch = makeFetch(router.listen(0));

describe("GET /posts", (it) => {
	let PostOnce: SinonStub;

	it.before.each(() => {
		PostOnce = sinon.stub(posts, "once").returns(Promise.resolve(postsRefData));
	});

	it.after.each(() => PostOnce.restore());

	it("is returning code 200 with posts list", async () => {
		await fetch("/").expect(200, { code: 200, posts: postsCompiled });
	});

	it("is returning code 500 with specific error code if there was error in listAll() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostOnce.resolves({});
		await fetch("/").expect(500, {
			code: 500,
			message: messages[500],
			error: "LA507_25",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("POST /posts", (it) => {
	let PostChild: SinonStub;
	let PostUpdate: SinonStub;

	it.before.each(() => {
		PostChild = sinon.stub(posts, "child").returns(posts);
		PostUpdate = sinon.stub(posts, "update").resolves({});
	});

	it.after.each(() => (PostChild.restore(), PostUpdate.restore()));

	it("i sreturning code 201 if creation was successful", async () => {
		await fetch("/", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(postData),
		}).expect(201, { code: 201, message: messages[201][1] });
	});

	it("is returning code 400 on not providing enough informations", async () => {
		await fetch("/", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		}).expect(400, { code: 400, message: messages[400][0] });
	});

	it("is returning code 500 with specific error code if there was error in listAll() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostUpdate.rejects({});
		await fetch("/", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(postData),
		}).expect(500, {
			code: 500,
			message: messages[500],
			error: "CP508_32",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});
