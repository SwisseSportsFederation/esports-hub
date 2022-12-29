import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth, logout } from "~/utils/auth.server";
import auth0 from 'auth0';
import { db } from "~/services/db.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method !== "DELETE") {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string(),
  });
  const user = await checkUserAuth(request);
  const user_id = Number(entityId);
  if(user_id !== Number(user.db.id)) {
    throw json({}, 403)
  }

  if(!user.db.auth_id) {
    throw json({}, 500);
  }

  try {
    const test = new auth0.ManagementClient({
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      scope: 'delete:users',
      domain: process.env.AUTH0_DOMAIN,
    });

    await db.user.delete({
      where: {
        id: user_id
      }
    });

    await test.deleteUser({ id: user.db.auth_id });
    return logout(request, '/')
  } catch(error) {
    console.log(error);
    throw json({}, 500)
  }
};
