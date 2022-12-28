import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");


export const action: ActionFunction = async ({ request }) => {
  const { userId, entityId, entity } = await zx.parseForm(request, {
    userId: z.string(),
    entityId: z.string(),
    entity: z.enum(['TEAM', 'ORG'])
  });
  const user = await checkUserAuth(request);
  const user_id = Number(userId);
  const entity_id = Number(entityId);

  if(Number(user.db.id) !== user_id) {
    throw json({}, 403);
  }

  const membership = await db.teamMember.findFirst({
    where: {
      user_id,
      team_id: entity_id
    },
    select: {
      access_rights: true
    }
  })

  await db.team.delete({
    where: {
      id: entity_id
    }
  });

  return json({});
};
