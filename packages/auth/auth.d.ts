// app.d.ts
/// <reference types="lucia" />
declare namespace Lucia {
	type Auth = import("./index").Auth;
	interface DatabaseUserAttributes {
		username: string;
	};
	interface DatabaseSessionAttributes {};
}
