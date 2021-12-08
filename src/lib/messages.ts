export default {
	500: "We faced a problem in our server, and our developers have been notifed of this problem. PLease try again later.",
	404: [
		"The user you were looking for was not found",
		"No post was found in that name",
	],
	400: [
		"You have not provided enough information",
		"Your reference code is incorrect",
		"User already exists",
	],
	401: ["Your reference code is incorrect"],
	403: ["The password you've provided is wrong"],
	201: ["User was successfully created", "Post was successfully created"],
	200: [
		"If any user existed with that username/sessionkey, the user was successfully logged out",
		"The user was successfully edited",
		"The user was successfully deleted",
		"The post was successfully edited",
		"The post was successfully deleted",
	],
};
