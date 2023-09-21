import { cache } from "react";
import * as context from "next/headers";
import { planetscale } from "@lucia-auth/adapter-mysql";
import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";

import { db_connection } from "@acme/db";

import { env } from "./env.mjs";
import { authentik } from "./AuthentikProvider";


// expect error (see next section)
export const auth = lucia({
  env: "DEV", // "PROD" if deployed to HTTPS
  middleware: nextjs_future(), // NOT nextjs()
  sessionCookie: {
    expires: false,
  },
  adapter: planetscale(db_connection, {
    user: "auth_user",
    key: "user_key",
    session: "user_session",
  }),
  getUserAttributes: (data) => {
    return {
      use: data.username,
    }
  }
});

export const authentikAuth = authentik(auth, {
  clientId: env.AUTHENTIK_CLIENT_ID,
  clientSecret: env.AUTHENTIK_CLIENT_SECRET,
  authentikUrl: env.AUTHENTIK_BASE_URL,
  redirectUri: "http://localhost:3000/login/authentik/callback",
})

export type Auth = typeof auth;

export const getPageSession = cache(() => {
  const authRequest = auth.handleRequest("GET", context);
  return authRequest.validate();
});
