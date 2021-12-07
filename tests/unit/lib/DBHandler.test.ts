import fs from "fs/promises";
import assert from "assert";
import sinon, { SinonStub } from "sinon";
import Mail from "nodemailer/lib/mailer/index.js";

import { describe } from "../../helpers/describe.js";
import DBHandler from "../../../src/lib/DBHandler.js";
import { db, users, posts } from "../../../src/lib/initDB.js";
import {
	userValues,
	data,
	invalidData,
	userRefData,
	aUser,
	invalidRefData,
	rawPass,
	editedUser,
	postsRefData,
	postsCompiled,
	slug,
	postData,
	postDataS,
	invalidPostDataS,
	editedPostData,
} from "../../helpers/variables.js";
import { initJobs } from "../../../src/lib/utils.js";

describe("Function: users.registerUser", (it) => {
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

	it("is returning 201 on correctly registering user", async () => {
		const userRegistered = await DBHandler.users.registerUser(aUser.user);
		assert.equal(
			userRegistered.code,
			201,
			"Function registerUser() should return code 201"
		);
	});

	it("is returning code 400 if user exists", async () => {
		UserOnce.resolves(data);
		const userRegistered = await DBHandler.users.registerUser(aUser.user);
		assert.equal(
			userRegistered.code,
			400,
			"Function registerUser() should return code 400"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		const userRegistered = await DBHandler.users.registerUser(aUser.user);
		assert.equal(
			userRegistered.code,
			500,
			"Function registerUser() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
	// db.goOffline();
});

describe("Function: users.loginUser", (it) => {
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

	it("is processing login and returning an object including code and sessionkey on valid data", async () => {
		const userLogged = await DBHandler.users.loginUser(
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userLogged.code,
			200,
			"Function loginUser() should return code 200"
		);
		assert(userLogged.sessionkey, "Value of sessionkey must not be falsy:");
	});

	it("is returning code 404 if user doesn't exist", async () => {
		UserOnce.resolves(invalidData);
		const userLogged = await DBHandler.users.loginUser(
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userLogged.code,
			404,
			"Function loginUser() should return code 404"
		);
	});

	it("is returning code 403 if password doesn't match", async () => {
		const userLogged = await DBHandler.users.loginUser(
			aUser.user.username,
			"invalidPass"
		);
		assert.equal(
			userLogged.code,
			403,
			"Function loginUser() should return code 403"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		const userLogged = await DBHandler.users.loginUser(
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userLogged.code,
			500,
			"Function loginUser() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: users.logoutUser", (it) => {
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

	it("is returning and calling correct functions while passing username only", async () => {
		const userLoggedOut = await DBHandler.users.logoutUser(userValues.username);
		assert.equal(userLoggedOut.code, 200, "The return code should be 200:");
		assert(UserChild.calledOnce, "Function child() should be called once:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(UserRemove, "Function remove() should be called once");
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
	});

	it("is returning and calling correct functions while passing sessionkey only", async () => {
		UserOnce.resolves(userRefData);
		const userLoggedOut = await DBHandler.users.logoutUser(
			undefined,
			userValues.sessionkey
		);
		assert.equal(userLoggedOut.code, 200, "The return code should be 200:");
		assert(
			UserOrderChild.calledOnce,
			"Function orderByChild() should be called once:"
		);
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(UserEqualTo.calledOnce, "Function equalTo() should be called once:");
		assert(UserRemove, "Function remove() should be called once");
	});

	it("is returning code 200 when username not found", async () => {
		UserOnce.resolves(invalidData);
		const userLoggedOut = await DBHandler.users.logoutUser("auser");
		assert.equal(userLoggedOut.code, 200, "The return code should be 200:");
		assert(UserChild.calledOnce, "Function child() should be called once:");
		assert(UserRemove, "Function remove() should be called once");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
	});

	it("is returning code 200 when sessionkey not found", async () => {
		UserOnce.resolves(invalidRefData);
		const userLoggedOut = await DBHandler.users.logoutUser(undefined, "akey");
		assert.equal(userLoggedOut.code, 200, "The return code should be 200:");
		assert(
			UserOrderChild.calledOnce,
			"Function orderByChild() should be called once:"
		);
		assert(UserRemove, "Function remove() should be called once");
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(UserEqualTo.calledOnce, "Function equalTo() should be called once:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is returning code 400 if no param is passed in it", async () => {
		const userLoggedOut = await DBHandler.users.logoutUser();
		assert.equal(userLoggedOut.code, 400, "The function return code 400:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserOnce.calledOnce, "Function once() should not be called:");
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserRemove.rejects({});
		const userLoggedOut = await DBHandler.users.logoutUser(userValues.username);
		assert.equal(
			userLoggedOut.code,
			500,
			"Function checkUser() code should return 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: users.editUser", (it) => {
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

	it("is editing user and returning code 200 on successful editing", async () => {
		const userEdited = await DBHandler.users.editUser(
			editedUser,
			aUser.user.username,
			rawPass
		);
		assert(
			!Object.keys(UserUpdate.args[0][0]).includes("last_name"),
			"Arguments should not contain last_name"
		);
		assert.equal(
			userEdited.code,
			200,
			"Function editUser() should return code 200"
		);
	});

	it("is returning code 404 if user doesn't exist", async () => {
		UserOnce.resolves(invalidData);
		const userEdited = await DBHandler.users.editUser(
			editedUser,
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userEdited.code,
			404,
			"Function editUser() should return code 404"
		);
	});

	it("is returning code 403 if password doesn't match", async () => {
		const userEdited = await DBHandler.users.editUser(
			editedUser,
			aUser.user.username,
			"invalidPass"
		);
		assert.equal(
			userEdited.code,
			403,
			"Function editUser() should return code 403"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		const userEdited = await DBHandler.users.editUser(
			editedUser,
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userEdited.code,
			500,
			"Function editUser() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: users.deleteUser", (it) => {
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

	it("is deleting user and returning an object including code and sessionkey on valid data", async () => {
		const userDeleted = await DBHandler.users.deleteUser(
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userDeleted.code,
			200,
			"Function deleteUser() should return code 200"
		);
		assert(
			UserRemove.calledOnce,
			"Function users.remove() should be called once"
		);
	});

	it("is returning code 404 if user doesn't exist", async () => {
		UserOnce.resolves(invalidData);
		const userDeleted = await DBHandler.users.deleteUser(
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userDeleted.code,
			404,
			"Function deleteUser() should return code 404"
		);
	});

	it("is returning code 403 if password doesn't match", async () => {
		const userDeleted = await DBHandler.users.deleteUser(
			aUser.user.username,
			"invalidPass"
		);
		assert.equal(
			userDeleted.code,
			403,
			"Function deleteUser() should return code 403"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		const userDeleted = await DBHandler.users.deleteUser(
			aUser.user.username,
			rawPass
		);
		assert.equal(
			userDeleted.code,
			500,
			"Function deleteUser() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: users.fetchUser", (it) => {
	// db.goOnline();

	let UserChild: SinonStub;
	let UserOrderChild: SinonStub;
	let UserEqualTo: SinonStub;
	let UserOnce: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").resolves(data);
		UserOrderChild = sinon.stub(users, "orderByChild").returns(users);
		UserEqualTo = sinon.stub(users, "equalTo").returns(users);
	});

	it.after.each(
		() => (
			UserChild.restore(),
			UserOrderChild.restore(),
			UserEqualTo.restore(),
			UserOnce.restore()
		)
	);

	it("is returning correct data and calling correct functions while passing username only", async () => {
		const user = await DBHandler.users.fetchUser(userValues.username);
		assert.deepStrictEqual(
			user,
			aUser,
			"The user should return correct datas:"
		);
		assert(UserChild.calledOnce, "Function child() should be called once:");
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
	});

	it("is returning correct data and calling correct functions while passing sessionkey only", async () => {
		UserOnce.resolves(userRefData);
		const user = await DBHandler.users.fetchUser(
			undefined,
			userValues.sessionkey
		);
		assert.deepStrictEqual(
			user,
			aUser,
			"The user should return correct datas:"
		);
		assert(
			UserOrderChild.calledOnce,
			"Function orderByChild() should be called once:"
		);
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(UserEqualTo.calledOnce, "Function equalTo() should be called once:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is returning code 404 when username not found", async () => {
		UserOnce.resolves(invalidData);
		const user = await DBHandler.users.fetchUser("auser");
		assert.equal(user.code, 404, "The user code should be 404:");
		assert(UserChild.calledOnce, "Function child() should be called once:");
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
	});

	it("is returning code 404 when sessionkey not found", async () => {
		UserOnce.resolves(invalidRefData);
		const user = await DBHandler.users.fetchUser(undefined, "akey");
		assert.equal(user.code, 404, "The user code should be 404:");
		assert(
			UserOrderChild.calledOnce,
			"Function orderByChild() should be called once:"
		);
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(UserEqualTo.calledOnce, "Function equalTo() should be called once:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is returning undefined if no param is passed in it", async () => {
		const user = await DBHandler.users.fetchUser();
		assert(!user, "The function return value should be falsy:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserOnce.calledOnce, "Function once() should not be called:");
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		const user = await DBHandler.users.fetchUser(userValues.username);
		assert.equal(user.code, 500, "The user should return 500");
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: users.checkUser", (it) => {
	let UserChild: SinonStub;
	let UserOrderChild: SinonStub;
	let UserEqualTo: SinonStub;
	let UserOnce: SinonStub;

	it.before.each(() => {
		UserChild = sinon.stub(users, "child").returns(users);
		UserOnce = sinon.stub(users, "once").returns(Promise.resolve(data));
		UserOrderChild = sinon.stub(users, "orderByChild").returns(users);
		UserEqualTo = sinon.stub(users, "equalTo").returns(users);
	});

	it.after.each(
		() => (
			UserChild.restore(),
			UserOrderChild.restore(),
			UserEqualTo.restore(),
			UserOnce.restore()
		)
	);

	it("is returning and calling correct functions while passing username only", async () => {
		const userExists = await DBHandler.users.checkUser(userValues.username);
		assert.equal(
			userExists.exists,
			true,
			"The user should be found in the database:"
		);
		assert.equal(userExists.code, 200, "The return code should be 200:");
		assert(UserChild.calledOnce, "Function child() should be called once:");
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
	});

	it("is returning and calling correct functions while passing sessionkey only", async () => {
		UserOnce.resolves(userRefData);
		const userExists = await DBHandler.users.checkUser(
			undefined,
			userValues.sessionkey
		);
		assert.equal(
			userExists.exists,
			true,
			"The user should be found in the database:"
		);
		assert.equal(userExists.code, 200, "The return code should be 200:");
		assert(
			UserOrderChild.calledOnce,
			"Function orderByChild() should be called once:"
		);
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(UserEqualTo.calledOnce, "Function equalTo() should be called once:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is returning false when username not found", async () => {
		UserOnce.resolves(invalidData);
		const userExists = await DBHandler.users.checkUser("auser");
		assert.equal(userExists.code, 200, "The return code should be 200:");
		assert(!userExists.exists, "The user should not be found in the database:");
		assert(UserChild.calledOnce, "Function child() should be called once:");
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
	});

	it("is returning false when sessionkey not found", async () => {
		UserOnce.resolves(invalidRefData);
		const userExists = await DBHandler.users.checkUser(undefined, "akey");
		assert.equal(userExists.code, 200, "The return code should be 200:");
		assert(!userExists.exists, "The user should not be found in the database:");
		assert(
			UserOrderChild.calledOnce,
			"Function orderByChild() should be called once:"
		);
		assert(UserOnce.calledOnce, "Function once() should be called once:");
		assert(UserEqualTo.calledOnce, "Function equalTo() should be called once:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is returning code 400 if no param is passed in it", async () => {
		const userExists = await DBHandler.users.checkUser();
		assert.equal(userExists.code, 400, "The function return code 400:");
		assert(
			!UserOrderChild.calledOnce,
			"Function orderByChild() should not be called:"
		);
		assert(!UserOnce.calledOnce, "Function once() should not be called:");
		assert(!UserEqualTo.calledOnce, "Function equalTo() should not be called:");
		assert(!UserChild.calledOnce, "Function child() should not be called:");
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		UserOnce.resolves({});
		const userExists = await DBHandler.users.checkUser(userValues.username);
		assert.equal(
			userExists.code,
			500,
			"Function checkUser() code should return 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});

	db.goOffline();
});

describe("Function: posts.listAll", (it) => {
	let PostOnce: SinonStub;

	it.before.each(() => {
		PostOnce = sinon.stub(posts, "once").returns(Promise.resolve(postsRefData));
	});

	it.after.each(() => PostOnce.restore());

	it("is returning posts and code 200 successfully", async () => {
		const allPosts = await DBHandler.posts.listAll();
		assert.equal(
			allPosts.code,
			200,
			"function lisAll() should return code 200"
		);
		assert.deepEqual(
			allPosts.posts,
			postsCompiled,
			"Function listAll() should return as postsData"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostOnce.resolves({});
		const allPosts = await DBHandler.posts.listAll();
		assert.equal(
			allPosts.code,
			500,
			"Function listAll() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: posts.createPost", (it) => {
	let PostChild: SinonStub;
	let PostUpdate: SinonStub;

	it.before.each(() => {
		PostChild = sinon.stub(posts, "child").returns(posts);
		PostUpdate = sinon.stub(posts, "update").resolves({});
	});

	it.after.each(() => (PostChild.restore(), PostUpdate.restore()));

	it("is returning code 201 on successful creation", async () => {
		const postCreated = await DBHandler.posts.createPost(slug, postData);
		assert.equal(
			postCreated.code,
			201,
			"Function createPost should return code 201"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostUpdate.rejects({});
		const postCreated = await DBHandler.posts.createPost(slug, postData);
		assert.equal(
			postCreated.code,
			500,
			"Function createPost() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: posts.fetchPost", (it) => {
	let PostChild: SinonStub;
	let PostOnce: SinonStub;

	it.before.each(() => {
		PostChild = sinon.stub(posts, "child").returns(posts);
		PostOnce = sinon.stub(posts, "once").resolves(postDataS);
	});

	it.after.each(() => (PostChild.restore(), PostOnce.restore()));

	it("is returning code 200 and post if post exists", async () => {
		const post = await DBHandler.posts.fetchPost(slug);
		assert.deepEqual(
			post,
			{ code: 200, post: postData },
			"Function fetchPost should return code 200 and a post object"
		);
	});

	it("is returning code 404 if post doesn't exist", async () => {
		PostOnce.resolves(invalidPostDataS);

		const post = await DBHandler.posts.fetchPost("slug");
		assert.equal(post.code, 404, "Function fetchPost() should return code 404");
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostOnce.resolves({});
		const post = await DBHandler.posts.fetchPost("slug");
		assert.equal(post.code, 500, "Function fetchPost() should return code 500");
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: posts.editPost", (it) => {
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
		const postEdited = await DBHandler.posts.editPost(slug, editedPostData);
		assert.equal(
			postEdited.code,
			200,
			"Function editPost() should return code 200"
		);
	});

	it("is returning code 404 if post doesn't exist", async () => {
		PostOnce.resolves(invalidPostDataS);

		const postEdited = await DBHandler.posts.editPost("invalidPost", {});
		assert.equal(
			postEdited.code,
			404,
			"Function editPost() should return code 404"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostUpdate.rejects({});
		const postEdited = await DBHandler.posts.editPost(slug, editedPostData);
		assert.equal(
			postEdited.code,
			500,
			"Function editPost() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: posts.deletePost", (it) => {
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

	it("is returning code 200 on successful editing", async () => {
		const postDeleted = await DBHandler.posts.deletePost(slug);
		assert.equal(
			postDeleted.code,
			200,
			"Function deletePost() should return code 200"
		);
	});

	it("is returning code 404 if post doesn't exist", async () => {
		PostOnce.resolves(invalidPostDataS);

		const postDeleted = await DBHandler.posts.deletePost("invalidPost");
		assert.equal(
			postDeleted.code,
			404,
			"Function deletePost() should return code 404"
		);
	});

	it("is handling errors", async () => {
		const stubMailer = sinon.stub(Mail.prototype, "sendMail").resolves(true);
		const stubConsole = sinon.stub(console, "error");
		PostRemove.rejects({});
		const postDeleted = await DBHandler.posts.deletePost(slug);
		assert.equal(
			postDeleted.code,
			500,
			"Function deletePost() should return code 500"
		);
		assert(stubMailer.calledOnce, "Function handleE() should be called once:");
		assert(stubConsole.calledOnce, "Function handleE() should be called once:");
		stubMailer.restore();
		stubConsole.restore();
	});
});

describe("Function: refDB.match", (it) => {
	initJobs();

	const [key, invalidKey] = ["testcode", "invalidKey"];

	it("is returning true if codes contains a specific element", async () => {
		const doesExist = await DBHandler.refDB.match(key);
		assert(doesExist, "Function refDB.match() should return true");
	});

	it("is returning false if codes doesn't contain a specific element", async () => {
		const doesExist = await DBHandler.refDB.match(invalidKey);
		assert(!doesExist, "Function refDB.match() should return false");
	});
});

describe("Function: refDB.store", (it) => {
	initJobs();

	const key = "appendedViaTests";

	let stubAppend: SinonStub;

	it.before.each(() => {
		stubAppend = sinon.stub(fs, "appendFile").resolvesArg(0);
	});

	it.after.each(() => stubAppend.restore());

	it("is storing code to the file correctly", async () => {
		await DBHandler.refDB.store(key);
		assert.equal(
			global.codes.pop(),
			key,
			"Function refDB.store() is storing code to global.codes"
		);
	});
});

process.on("SIGTERM", () => {
	db.goOffline();
});
process.on("exit", () => {
	db.goOffline();
});
