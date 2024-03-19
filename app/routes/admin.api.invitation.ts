import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@vercel/remix";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { RequestStatus } from "@prisma/client";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: group_id, userId: user_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString,
    userId: zx.NumAsString
  });
  const user = await checkUserAuth(request);

  const currentRequestStatus = await db.groupMember.findFirst({
    where: {
      user_id,
      group_id
    },
    select: {
      request_status: true
    }
  });
  if(currentRequestStatus?.request_status !== RequestStatus.PENDING_USER) {
    await checkIdAccessForEntity(user.db.id, group_id, 'MODERATOR');
  }
  try {
    if(action === 'ACCEPT') {
      await db.groupMember.update({
        where: {
          user_id_group_id: {
            user_id,
            group_id
          }
        },
        data: {
          request_status: 'ACCEPTED'
        }
      });

    } else {
      await db.groupMember.delete({
        where: {
          user_id_group_id: {
            user_id,
            group_id
          }
        }
      });
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
