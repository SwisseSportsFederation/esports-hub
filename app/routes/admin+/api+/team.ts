import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@vercel/remix";
import { deleteEntity } from "~/services/admin/api/deleteEntity.server";
import { createEntity } from "~/services/admin/api/createEntity.server";
import { createFlashMessage } from "~/services/toast.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  switch (request.method) {
    case "DELETE":
      return deleteEntity(request);
    case "POST":
      return createEntity(request);
  }
};

