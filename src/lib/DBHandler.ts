import bcrypt from "bcrypt";
import fs from "fs/promises";
import { v4 } from "uuid";
import { DataSnapshot } from "@firebase/database-types";

import { users, posts } from "./initDB.js";
import {
	AllPostsResp,
	EditData,
	EditPost,
	Post,
	User,
	UserExistsResp,
	UserResp,
} from "./types.js";
import { handleE } from "./utils.js";

export default class DBHandler {
	public static users = {
		registerUser: async (user: User): Promise<Record<string, number>> => {
			try {
				const dataExists = await (
					await users.child(user.username).once("value")
				).exists();
				if (dataExists) {
					return { code: 400 };
				}
				const password = await bcrypt.hash(user.password, global.saltR);
				await users.child(user.username).update({
					first_name: user.first_name,
					last_name: user.last_name,
					email: user.email,
					password: password,
					col_no: user.col_no,
					avatar: user.avatar,
				});
				return { code: 201 };
			} catch (e) {
				await handleE(e, "ERR RU502 (in registerUser())");
				return { code: 500 };
			}
		},

		loginUser: async (
			username: string,
			password: string
		): Promise<Record<string, number | string>> => {
			try {
				const dataExists = await (
					await users.child(username).once("value")
				).exists();
				if (!dataExists) {
					return { code: 404 };
				}
				const oldPassword = (
					await (await users.child(username).once("value")).val()
				).password;
				const doesMatch = await bcrypt.compare(password, oldPassword);
				if (doesMatch) {
					const sessionkey = v4();
					await users.child(username).update({ sessionkey: sessionkey });
					return { code: 200, sessionkey: sessionkey };
				} else {
					return { code: 403 };
				}
			} catch (e) {
				await handleE(e, "ERR LU503 (in loginUser())");
				return { code: 500 };
			}
		},

		logoutUser: async (
			username?: string,
			sessionkey?: string
		): Promise<Record<string, number>> => {
			try {
				if (username) {
					await users.child(`${username}/sessionkey`).remove();
				} else if (sessionkey) {
					const user = await users
						.orderByChild("sessionkey")
						.equalTo(sessionkey)
						.once("value");
					Object.keys(await user.val()).forEach(
						async (v) => await users.child(`${v}/sessionkey`).remove()
					);
				} else {
					return { code: 400 };
				}
				return { code: 200 };
			} catch (e) {
				await handleE(e, "ERR LT505 (in logoutUser())");
				return { code: 500 };
			}
		},

		editUser: async (
			user: EditData,
			username: string,
			oldPassword: string
		): Promise<Record<string, number>> => {
			try {
				const dataExists = await (
					await users.child(username).once("value")
				).exists();
				if (!dataExists) {
					return { code: 404 };
				}
				const dbPassword = (
					await (await users.child(username).once("value")).val()
				).password;
				const doesMatch = await bcrypt.compare(oldPassword, dbPassword);
				if (doesMatch) {
					Object.keys(user).forEach(
						(k) => user[k] === undefined && delete user[k]
					);

					if (user.password) {
						user.password = await bcrypt.hash(user.password, global.saltR);
					}

					await users.child(username).update(user);
					return { code: 200 };
				} else {
					return { code: 403 };
				}
			} catch (e) {
				await handleE(e, "ERR EU506 (in editUser())");
				return { code: 500 };
			}
		},

		deleteUser: async (
			username: string,
			password: string
		): Promise<Record<string, number>> => {
			try {
				const dataExists = await (
					await users.child(username).once("value")
				).exists();
				if (!dataExists) {
					return { code: 404 };
				}
				const oldPassword = (
					await (await users.child(username).once("value")).val()
				).password;
				const doesMatch = await bcrypt.compare(password, oldPassword);
				if (doesMatch) {
					await users.child(username).remove();
					return { code: 200 };
				} else {
					return { code: 403 };
				}
			} catch (e) {
				await handleE(e, "ERR DU504 (in deleteUser())");
				return { code: 500 };
			}
		},

		fetchUser: async (
			username?: string,
			sessionkey?: string
		): Promise<UserResp> => {
			try {
				let data: DataSnapshot;
				let user: User;
				let temp: unknown;
				if (username) {
					data = await users.child(username).once("value");
					if (!data.exists()) {
						return { code: 404 };
					}
					user = await data.val();
				} else if (sessionkey) {
					data = await users
						.orderByChild("sessionkey")
						.equalTo(sessionkey)
						.once("value");
					if (!data.exists()) {
						return { code: 404 };
					}
					temp = await data.val();
					username = Object.keys(temp)[0];
					user = temp[username];
				} else {
					return;
				}
				return {
					code: 200,
					user: {
						username: username,
						first_name: user.first_name,
						last_name: user.last_name,
						email: user.email,
						password: user.password,
						col_no: user.col_no,
						avatar: user.avatar,
					},
				};
			} catch (e) {
				await handleE(e, "ERR FU501 (in fetchUser())");
				return { code: 500 };
			}
		},

		checkUser: async (
			username?: string,
			sessionkey?: string
		): Promise<UserExistsResp> => {
			try {
				let data: DataSnapshot;
				if (username) {
					data = await users.child(username).once("value");
				} else if (sessionkey) {
					data = await users
						.orderByChild("sessionkey")
						.equalTo(sessionkey)
						.once("value");
				} else {
					return { code: 400 };
				}
				return { code: 200, exists: data.exists() };
			} catch (e) {
				await handleE(e, "ERR CU500 (in checkUser())");
				return { code: 500 };
			}
		},
	};

	public static posts = {
		listAll: async (): Promise<AllPostsResp> => {
			try {
				const postsArray = [] as Post[];
				const postsJson = await (await posts.once("value")).val();
				Object.keys(postsJson).forEach(async (v) => {
					postsArray.push({
						slug: v,
						...postsJson[v],
					});
				});
				return { code: 200, posts: postsArray };
			} catch (e) {
				await handleE(e, "ERR LA507 (in listAll())");
				return { code: 500 };
			}
		},

		createPost: async (
			slug: string,
			postData: Post
		): Promise<Record<string, number>> => {
			try {
				await posts.child(slug).update({
					title: postData.title,
					feature_img: postData.feature_img,
					author: postData.author,
					datetime: postData.datetime,
					content: postData.content,
				});
				return { code: 201 };
			} catch (e) {
				await handleE(e, "ERR CP508 (in createPost())");
				return { code: 500 };
			}
		},

		fetchPost: async (slug: string): Promise<Record<string, Post | number>> => {
			try {
				const post = await (await posts.child(slug).once("value")).val();
				if (post) {
					return { code: 200, post: post };
				} else {
					return { code: 404 };
				}
			} catch (e) {
				await handleE(e, "ERR FP509 (in fetchPost())");
				return { code: 500 };
			}
		},

		editPost: async (
			slug: string,
			postData: EditPost
		): Promise<Record<string, number>> => {
			try {
				const postExists = await (
					await posts.child(slug).once("value")
				).exists();
				if (!postExists) {
					return { code: 404 };
				}
				Object.keys(postData).forEach(
					(k) => postData[k] === undefined && delete postData[k]
				);
				await posts.child(slug).update(postData);
				return { code: 200 };
			} catch (e) {
				await handleE(e, "ERR EP510 (in editPost())");
				return { code: 500 };
			}
		},

		deletePost: async (slug: string): Promise<Record<string, number>> => {
			try {
				const postExists = await (
					await posts.child(slug).once("value")
				).exists();
				if (!postExists) {
					return { code: 404 };
				}
				await posts.child(slug).remove();
				return { code: 200 };
			} catch (e) {
				await handleE(e, "ERR DP511 (in deletePost())");
				return { code: 500 };
			}
		},
	};

	public static refDB = {
		match: async (code: string): Promise<boolean> =>
			global.codes.includes(code),

		store: async (code: string): Promise<void> =>
			await fs
				.appendFile("./refcodes.txt", `\n${code}`)
				.then(async () => global.codes.push(code)),
	};
}
