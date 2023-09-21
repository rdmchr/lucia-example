import { bigint, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const user = mySqlTable("auth_user", {
	id: varchar("id", {
		length: 15 // change this when using custom user ids
	}).primaryKey()
	// other user attributes
});

export const key = mySqlTable("user_key", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 15
	})
		.notNull(),
	hashedPassword: varchar("hashed_password", {
		length: 255
	})
});

export const session = mySqlTable("user_session", {
	id: varchar("id", {
		length: 128
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 15
	})
		.notNull(),
	activeExpires: bigint("active_expires", {
		mode: "number"
	}).notNull(),
	idleExpires: bigint("idle_expires", {
		mode: "number"
	}).notNull()
});
