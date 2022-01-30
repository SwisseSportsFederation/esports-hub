import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request);
};