import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTHENTIK_CLIENT_ID: z.string().min(1),
    AUTHENTIK_CLIENT_SECRET: z.string().min(1),
    AUTHENTIK_BASE_URL: z.string().url(),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
  },
  client: {},
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTHENTIK_BASE_URL: process.env.AUTHENTIK_BASE_URL,
    AUTHENTIK_CLIENT_ID: process.env.AUTHENTIK_CLIENT_ID,
    AUTHENTIK_CLIENT_SECRET: process.env.AUTHENTIK_CLIENT_SECRET,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
