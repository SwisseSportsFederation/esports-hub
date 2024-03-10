import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@vercel/remix";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth, checkSuperAdmin } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/superadmin");

export const action: ActionFunction = async ({ request }) => {
  const { action, handle: user_handle } = await zx.parseForm(request, {
    action: z.enum(['POST']),
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  await checkSuperAdmin(user.db.id);

  try {
    if(action === 'POST') {
		await db.user.update({
			where: {
				handle: user_handle
			},
			data: {
				is_superadmin: true
			}
		});
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
