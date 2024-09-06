import { RequestStatus } from "@prisma/client";
import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { db } from "~/services/db.server";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

const acceptInvitation = async (child_id: number, parent_id: number) => {
  const currentTeam = await db.groupToGroup.findFirst({
    where: {
      child_id,
      request_status: 'ACCEPTED'
    }
  });
  if (!currentTeam) {
    await db.groupToGroup.update({
      where: {
        child_id_parent_id: {
          child_id,
          parent_id
        }
      },
      data: {
        request_status: 'ACCEPTED'
      }
    });
  } else {
    throw new Error("Already in team.");
  }
}

const declineInvitation = async (child_id: number, parent_id: number) => {
  await db.groupToGroup.delete({
    where: {
      child_id_parent_id: {
        child_id,
        parent_id
      }
    }
  });
}

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: child_id, orgId: parent_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString,
    orgId: zx.NumAsString
  });
  const user = await checkUserAuth(request);
  const currentRequestStatus = await db.groupToGroup.findFirst({
    where: {
      parent_id,
      child_id
    },
    select: {
      request_status: true
    }
  });
  if (currentRequestStatus?.request_status !== RequestStatus.PENDING_PARENT_GROUP) {
    await checkIdAccessForEntity(user.db.id, child_id, 'ADMINISTRATOR');
  }

  try {
    if (action === 'ACCEPT') {
      await acceptInvitation(child_id, parent_id);
    } else {
      await declineInvitation(child_id, parent_id);
    }
  } catch (error) {
    throw json({}, 400);
  }
  return json({});
};
