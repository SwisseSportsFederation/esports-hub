import type { ActionFunction, LoaderFunction } from "@remix-run/react";
import { redirect } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request);
};