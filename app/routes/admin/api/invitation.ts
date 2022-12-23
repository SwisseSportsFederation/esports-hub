import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");


export const action: ActionFunction = async ({ request }) => {
  const { action, userId, entityId, entity } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
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

  try {
    if(action === 'ACCEPT') {
      if(entity === 'TEAM') {
        await db.teamMember.update({
          where: {
            user_id_team_id: {
              user_id,
              team_id: entity_id
            }
          },
          data: {
            request_status: 'ACCEPTED'
          }
        });
      } else {
        await db.organisationMember.update({
          where: {
            user_id_organisation_id: {
              user_id,
              organisation_id: entity_id
            }
          },
          data: {
            request_status: 'ACCEPTED'
          }
        });
      }

    } else {
      if(entity === 'TEAM') {
        await db.teamMember.delete({
          where: {
            user_id_team_id: {
              user_id,
              team_id: entity_id
            }
          }
        });
      } else {
        await db.organisationMember.delete({
          where: {
            user_id_organisation_id: {
              user_id,
              organisation_id: entity_id
            }
          }
        });
      }
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
