import { redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { createEntity } from "~/services/admin/api/createEntity.server";
import { deleteEntity } from "~/services/admin/api/deleteEntity.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  switch (request.method) {
    case "DELETE":
      return deleteEntity(request);
    case "POST":
      return createEntity(request);
  }
};
