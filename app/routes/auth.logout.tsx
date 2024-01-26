import { logout } from "~/utils/auth.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = async ({ request }) => {
  return logout(request);
};
