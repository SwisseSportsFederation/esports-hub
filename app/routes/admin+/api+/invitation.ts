import { RequestStatus } from "@prisma/client";
import { redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { json } from '@remix-run/server-runtime';
import { z } from "zod";
import { zx } from 'zodix';
import { db } from "~/services/db.server";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

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
  if (user_id === Number(user.db.id) && action === 'DECLINE') {
    // Bypass Authorization for user to decline his own request
    declineInvitation(user_id, group_id)
    return json({ toast: 'Deleted application for group' });
  }
  if (currentRequestStatus?.request_status !== RequestStatus.PENDING_USER) {
    await checkIdAccessForEntity(user.db.id, group_id, 'MODERATOR');
  }
  try {
    if (action === 'ACCEPT') {
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
      console.log(`Accept user ${user_id} to group ${group_id}`)
    } else {
      declineInvitation(user_id, group_id)
    }
  } catch (error) {
    throw json({}, 400);
  }
  return json({});
};

const declineInvitation = async (user_id: number, group_id: number) => {
  await db.groupMember.delete({
    where: {
      user_id_group_id: {
        user_id,
        group_id
      }
    }
  });
  console.log(`Decline user ${user_id} from group ${group_id}`)
}
