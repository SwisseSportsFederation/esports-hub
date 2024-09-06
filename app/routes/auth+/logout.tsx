import { redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { logout } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = async ({ request }) => {
  return logout(request);
};
