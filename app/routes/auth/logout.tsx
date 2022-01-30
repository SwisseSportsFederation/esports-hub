import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import logout from "~/utils/logout";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = async ({ request }) => {
  return logout(request);
};