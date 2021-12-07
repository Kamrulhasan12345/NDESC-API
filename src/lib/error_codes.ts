export default {
	prefix: "ERR_NDESC_API_",
	codes: {
		lib: {
			DBHandler: {
				users: {
					RU502_46: "registerUser()",
					LU503_41: "loginUser()",
					LT505_42: "logoutUser()",
					EU506_37: "editUser()",
					DU504_34: "deleteUser()",
					FU501_33: "fetchUser()",
					CU500_29: "checkUser()",
				},
				posts: {
					LA507_25: "listAll()",
					CP508_32: "createPost()",
					FP509_36: "fetchPost()",
					EP510_27: "editPost()",
					DP511_27: "deletePost()",
				},
			},
		},
		routes: {
			users: {
				SU14_45: "POST /users/signup",
				LO15_33: "POST /users/login",
				LG17_27: "PUT /users/logout",
				ED18_18: "PATCH /users/edit",
				DE16_16: "DELETE /users/delete",
				UN12_38: "GET /users/un/:username",
				SK13_34: "GET /users/sk/:sessionkey",
			},
			posts: {
				GP19_33: "GET /posts",
				CP20_21: "POST /posts",
			},
		},
	},
};
