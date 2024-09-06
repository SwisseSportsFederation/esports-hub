import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { ManagementClient } from 'auth0';
import { z } from 'zod';
import { zx } from 'zodix';
import { db } from '~/services/db.server';
import { checkUserAuth, logout } from '~/utils/auth.server';

export let loader: LoaderFunction = () => redirect('/admin');

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'DELETE') {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string(),
  });
  const user = await checkUserAuth(request);
  const user_id = Number(entityId);
  if (user_id !== Number(user.db.id)) {
    throw json({}, 403);
  }

  if (!user.db.auth_id) {
    throw json({}, 500);
  }

  try {

    const test = new ManagementClient({
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
    });

    await db.user.delete({
      where: {
        id: user_id,
      },
    });

    await test.users.delete({ id: user.db.auth_id });

    return logout(request, '/');
  } catch (error) {
    console.log(error);
    throw json({}, 500);
  }
};
