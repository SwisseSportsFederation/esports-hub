import { authenticator } from "~/services/auth.server";
import { redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request);
};
