import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method !== "DELETE") {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string(),
  });
  const user = await checkUserAuth(request);
  const entity_id = Number(entityId);

  try {
    const membership = await db.organisationMember.findFirstOrThrow({
      where: {
        user_id: Number(user.db.id),
        entity_id
      },
      select: {
        access_rights: true
      }
    });

    if(membership.access_rights !== "ADMINISTRATOR") {
      return json({}, 403);
    }

    await db.organisation.delete({
      where: {
        id: entity_id
      }
    });
  } catch(error) {
    throw json({}, 404)
  }
  return json({});
};
