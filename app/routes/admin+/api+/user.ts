import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { z } from 'zod';
import { zx } from 'zodix';
import { deleteUser } from '~/services/admin/api/user.server';
import { checkUserAuth, logout } from '~/utils/auth.server';

export let loader: LoaderFunction = () => redirect('/admin');

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'DELETE') {
    throw json({}, 404);
  }
  const { entityId } = await zx.parseForm(request, {
    entityId: z.string()
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
    if (request.method === 'DELETE') {
      deleteUser(user, user_id)

      return logout(request, '/');
    }

  } catch (error: any) {
    console.log(error);
    return json({ toast: `Error updating user: ${error.message ?? ''}` }, { status: 500 });
  }
};
