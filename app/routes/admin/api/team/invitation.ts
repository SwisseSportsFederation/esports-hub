import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: z.string()
  });
  const user = await checkUserAuth(request);
  const entity_id = Number(entityId);
  const user_id = Number(user.db.id);

  try {
    if(action === 'ACCEPT') {
      await db.teamMember.update({
        where: {
          user_id_entity_id: {
            user_id,
            entity_id
          }
        },
        data: {
          request_status: 'ACCEPTED',
          access_rights: 'MEMBER'
        }
      });
    } else {
      await db.teamMember.delete({
        where: {
          user_id_entity_id: {
            user_id,
            entity_id
          }
        }
      });
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
