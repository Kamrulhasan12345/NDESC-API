import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin/lib/credential/index";

import serviceAccount from "./serviceAccount.json";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as ServiceAccount),
	databaseURL: process.env.DATABASE_URL,
});

export const db = admin.database();
export const users = db.ref("users");
export const posts = db.ref("posts");
