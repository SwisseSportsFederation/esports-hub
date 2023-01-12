import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: organisation_id, userId: user_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString,
    userId: zx.NumAsString
  });
  const user = await checkUserAuth(request);

  const currentRequestStatus = await db.organisationMember.findFirst({
    where: {
      user_id,
      organisation_id
    },
    select: {
      request_status: true
    }
  });
  if(currentRequestStatus?.request_status !== RequestStatus.PENDING_USER) {
    await checkIdAccessForEntity(user, organisation_id, 'ORG', 'MODERATOR');
  }
  try {
    if(action === 'ACCEPT') {
      await db.organisationMember.update({
        where: {
          user_id_organisation_id: {
            user_id,
            organisation_id
          }
        },
        data: {
          request_status: 'ACCEPTED'
        }
      });

    } else {
      await db.organisationMember.delete({
        where: {
          user_id_organisation_id: {
            user_id,
            organisation_id
          }
        }
      });
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
