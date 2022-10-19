import type { ActionFunction, LoaderFunction } from "@remix-run/react";
import { redirect } from "@remix-run/react";
import logout from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = async ({ request }) => {
  return logout(request);
};