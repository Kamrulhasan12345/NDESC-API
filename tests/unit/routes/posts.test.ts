import assert from "assert";
import sinon, { SinonStub } from "sinon";
import { makeFetch } from "supertest-fetch";

import { describe } from "../../helpers/describe.js";
import router from "../../../src/routes/posts.js";
import { db, posts } from "../../../src/lib/initDB.js";
import messages from "../../../src/lib/messages.js";
import {
	editedPostData,
	invalidPostDataS,
	postData,
	postDataS,
	postsCompiled,
	postsRefData,
	slug,
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

	it("is returning code 500 with specific error code if there was error in createPost() function", async () => {
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

describe("GET /posts/:slug", (it) => {
	let PostChild: SinonStub;
	let PostOnce: SinonStub;

	it.before.each(() => {
		PostChild = sinon.stub(posts, "child").returns(posts);
		PostOnce = sinon.stub(posts, "once").resolves(postDataS);
	});

	it.after.each(() => (PostChild.restore(), PostOnce.restore()));

	it("is returning code 200 and post if post exists", async () => {
		await fetch(`/${slug}`).expect(200, { code: 200, post: postData });
	});

	it(" is returning code 404 if post doesn't exist", async () => {
		PostOnce.resolves(invalidPostDataS);

		await fetch("/slug").expect(404, { code: 404, message: messages[404][1] });
	});

	it("is returning code 500 with specific error code if there was error in fetchPost() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostOnce.resolves({});
		await fetch("/slug").expect(500, {
			code: 500,
			message: messages[500],
			error: "FP509_36",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("PATCH /posts/:slug", (it) => {
	let PostChild: SinonStub;
	let PostOnce: SinonStub;
	let PostUpdate: SinonStub;

	it.before.each(() => {
		PostChild = sinon.stub(posts, "child").returns(posts);
		PostOnce = sinon.stub(posts, "once").resolves(postDataS);
		PostUpdate = sinon.stub(posts, "update").resolves({});
	});

	it.after.each(
		() => (PostChild.restore(), PostOnce.restore(), PostUpdate.restore())
	);

	it("is returning code 200 on successful editing", async () => {
		await fetch(`/${slug}`, {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(editedPostData),
		}).expect(200, { code: 200, message: messages[200][3] });
	});

	it("is returning code 404 if the post wasn't found", async () => {
		PostOnce.resolves(invalidPostDataS);

		await fetch("/invalidPost", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(editedPostData),
		}).expect(404, { code: 404, message: messages[404][1] });
	});

	it("is returning code 500 with specific error code if there was error in editPost() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostUpdate.rejects({});
		await fetch("/slug", {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(editedPostData),
		}).expect(500, {
			code: 500,
			message: messages[500],
			error: "EP510_27",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("DELETE /posts/:slug", (it) => {
	let PostChild: SinonStub;
	let PostOnce: SinonStub;
	let PostRemove: SinonStub;

	it.before.each(() => {
		PostChild = sinon.stub(posts, "child").returns(posts);
		PostOnce = sinon.stub(posts, "once").resolves(postDataS);
		PostRemove = sinon.stub(posts, "remove").resolves({});
	});

	it.after.each(
		() => (PostChild.restore(), PostOnce.restore(), PostRemove.restore())
	);

	it("is returning code 200 on successful deletion", async () => {
		await fetch(`/${slug}`, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}).expect(200, { code: 200, message: messages[200][4] });
	});

	it("is returning code 404 if post wasn't found", async () => {
		PostOnce.resolves(invalidPostDataS);

		await fetch(`/invalidPost`, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
	});

	it("is returning code 500 with specific error code if there was error in editPost() function", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostOnce.resolves({});
		await fetch("/slug", {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}).expect(500, {
			code: 500,
			message: messages[500],
			error: "DP511_27",
		});
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});
