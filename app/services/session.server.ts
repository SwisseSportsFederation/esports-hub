import { createCookieSessionStorage } from "@vercel/remix";

const sessionSecret = process.env.SESSION_SECRET;
if(!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
