export interface User {
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	col_no: number;
	avatar: string;
}

export interface Post {
	title: string;
	author: string;
	datetime: string;
	feature_img: string;
	content: string;
}

export interface UserResp {
	code: number;
	user?: User;
}

export interface UserExistsResp {
	code: number;
	exists?: boolean;
}

export interface EditData {
	first_name?: string;
	last_name?: string;
	email?: string;
	password?: string;
	col_no?: number;
	avatar?: string;
}

export interface AllPostsResp {
	code: number;
	posts?: Post[];
}
