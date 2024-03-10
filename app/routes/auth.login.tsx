import { authenticator } from "~/services/auth.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@vercel/remix";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request);
};
