import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkSuperAdmin, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/superadmin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: entity_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString
  });
  const user = await checkUserAuth(request);
  await checkSuperAdmin(user.db.id);

  try {
    if (action === 'ACCEPT') {
      await db.game.update({
        where: {
          id: entity_id
        },
        data: {
          is_active: true
        }
      });

    } else {
      await db.game.delete({
        where: {
          id: entity_id
        }
      });
    }
  } catch (error) {
    throw json({}, 400);
  }
  return json({});
};
