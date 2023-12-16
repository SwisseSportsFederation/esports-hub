import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteEntity } from "~/services/admin/api/deleteEntity.server";
import { createEntity } from "~/services/admin/api/createEntity.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  switch(request.method){
    case "DELETE":
      return deleteEntity(request);
    case "POST":
      return createEntity(request);
  }
};
