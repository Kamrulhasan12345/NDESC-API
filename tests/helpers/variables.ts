import { DataSnapshot } from "@firebase/database-types";
import { Post } from "../../src/lib/types";

export const userValues = {
	username: "testuser",
	sessionkey: "d5a39915-11e9-44af-b63d-57d99f9a6c4b",
};

export const data = {
	async val(): Promise<Record<string, string | number>> {
		return {
			col_no: 0o1,
			email: "testuser@testdomain.com",
			first_name: "test",
			last_name: "user",
			password: "$2b$10$YzXSx0xCjqNm/qLDDXcziuy7.6GC1vIED2dNTSvyxEeiLm3ZbOzyO",
			avatar: "testpic",
		};
	},
	exists(): boolean {
		return true;
	},
} as unknown as DataSnapshot;

export const userRefData = {
	async val(): Promise<Record<string, Record<string, string | number>>> {
		return {
			testuser: {
				col_no: 0o1,
				email: "testuser@testdomain.com",
				first_name: "test",
				last_name: "user",
				password:
					"$2b$10$YzXSx0xCjqNm/qLDDXcziuy7.6GC1vIED2dNTSvyxEeiLm3ZbOzyO",
				avatar: "testpic",
			},
		};
	},
	exists(): boolean {
		return true;
	},
} as unknown as DataSnapshot;

export const invalidData = {
	async val(): Promise<Record<string, string>> {
		return null;
	},
	exists(): boolean {
		return false;
	},
} as unknown as DataSnapshot;

export const invalidRefData = {
	async val(): Promise<Record<string, string>> {
		return {};
	},
	exists(): boolean {
		return false;
	},
} as unknown as DataSnapshot;

export const aUser = {
	code: 200,
	user: {
		username: "testuser",
		col_no: 0o1,
		email: "testuser@testdomain.com",
		first_name: "test",
		last_name: "user",
		password: "$2b$10$YzXSx0xCjqNm/qLDDXcziuy7.6GC1vIED2dNTSvyxEeiLm3ZbOzyO",
		avatar: "testpic",
	},
};

export const editedUser = {
	col_no: 0o1,
	email: "testuser@testdomain.com",
	first_name: "test",
	last_name: undefined,
	password: "mynewtestpass",
	avatar: "testpic",
};

export const rawPass = "mytestpass";

export const postsData = {
	testpost01: {
		title: "Test Post 01",
		author: "mohammadkh",
		datetime: "12345667",
		feature_img: "testpost01.png",
		content: "Here goes body **content**",
	},
	testpost02: {
		title: "Test Post 02",
		author: "mohammadkh",
		datetime: "12345800",
		feature_img: "testpost02.png",
		content: "Here goes body **content**",
	},
	testpost03: {
		title: "Test Post 03",
		author: "mohammadkh",
		datetime: "12348000",
		feature_img: "testpost03.png",
		content: "Here goes body **content**",
	},
};

export const postsCompiled = [
	{
		slug: "testpost01",
		title: "Test Post 01",
		author: "mohammadkh",
		datetime: "12345667",
		feature_img: "testpost01.png",
		content: "Here goes body **content**",
	},
	{
		slug: "testpost02",
		title: "Test Post 02",
		author: "mohammadkh",
		datetime: "12345800",
		feature_img: "testpost02.png",
		content: "Here goes body **content**",
	},
	{
		slug: "testpost03",
		title: "Test Post 03",
		author: "mohammadkh",
		datetime: "12348000",
		feature_img: "testpost03.png",
		content: "Here goes body **content**",
	},
];

export const postsRefData = {
	async val(): Promise<Record<string, Record<string, string | number>>> {
		return postsData;
	},
	exists(): boolean {
		return true;
	},
} as unknown as DataSnapshot;

export const slug = "lorem-ipsum-dolor-8615i23u";

export const postData: Post = {
	title: "Lorem Ipsum dolor",
	author: "mohammadkh",
	datetime: "12345678",
	feature_img: "lorem-8615i23u.png",
	content: "#Lorem Ipsum sit dolor\nHere is the body.",
};

export const postDataS = {
	async val(): Promise<Post> {
		return postData;
	},
	async exists(): Promise<boolean> {
		return true;
	},
} as unknown as DataSnapshot;

export const invalidPostDataS = {
	async val(): Promise<Post> {
		return null;
	},
	async exists(): Promise<boolean> {
		return false;
	},
} as unknown as DataSnapshot;

export const editedPostData = {
	title: "Lorem Ipsum dolor",
	datetime: "12345678",
	feature_img: "lorem-8615i23u.png",
	content: "#Lorem Ipsum sit dolor\nHere is the body.",
};
