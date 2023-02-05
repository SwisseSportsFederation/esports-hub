import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { RequestStatus } from "@prisma/client";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: team_id, userId: user_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString,
    userId: zx.NumAsString
  });
  const user = await checkUserAuth(request);
  const currentRequestStatus = await db.teamMember.findFirst({
    where: {
      user_id,
      team_id
    },
    select: {
      request_status: true
    }
  });
  if(currentRequestStatus?.request_status !== RequestStatus.PENDING_USER) {
    await checkIdAccessForEntity(user.db.id, team_id, 'TEAM', 'MODERATOR');
  }

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
