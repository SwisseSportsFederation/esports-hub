import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: team_id, userId: user_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString,
    userId: zx.NumAsString
  });
  const user = await checkUserAuth(request);
  await checkIdAccessForEntity(user, team_id, 'TEAM', 'MODERATOR');

  try {
    if(action === 'ACCEPT') {
      await db.teamMember.update({
        where: {
          user_id_team_id: {
            user_id,
            team_id
          }
        },
        data: {
          request_status: 'ACCEPTED'
        }
      });
    } else {
      await db.teamMember.delete({
        where: {
          user_id_team_id: {
            user_id,
            team_id
          }
        }
      });
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
