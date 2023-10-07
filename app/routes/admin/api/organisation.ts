import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteEntity } from "~/services/admin/api/deleteEntity.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  return deleteEntity(request, 'ORGANISATION');
};
