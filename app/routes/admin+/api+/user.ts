import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { ManagementClient } from 'auth0';
import { z } from 'zod';
import { zx } from 'zodix';
import { AuthUser } from '~/services/auth.server';
import { db } from '~/services/db.server';
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

  } catch (error) {
    console.log(error);
    throw json({}, 500);
  }
};

export const updateEmail = async (user: AuthUser, user_id: number, email: string) => {
  const managementClient = new ManagementClient({
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    domain: process.env.AUTH0_DOMAIN,
  });

  await db.user.update({
    where: {
      id: user_id,
    },
    data: {
      email: email
    }
  });

  //const auth0ConnectionId = (await managementClient.connections.get({ id: user.db.auth_id! })).data.id
  const emailChangeResponse = await managementClient.users.update({ id: user.db.auth_id! }, { email: email });
  if (emailChangeResponse.status > 400) {
    // TODO maybe rollback email changes
    console.error(emailChangeResponse.statusText)
    throw new Error('Error changing Email for Authentication');
  }
  const emailVerifyResponse = await managementClient.jobs.verifyEmail({ user_id: user.db.auth_id! });
  if (emailVerifyResponse.status > 400) {
    // TODO maybe rollback email changes
    console.error(emailVerifyResponse.statusText)
    throw new Error('Error sending verification email');
  }
  return json({}, 200);
}

const deleteUser = async (user: AuthUser, user_id: number) => {
  const managementClient = new ManagementClient({
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    domain: process.env.AUTH0_DOMAIN,
  });

  await db.user.delete({
    where: {
      id: user_id,
    },
  });

  return await managementClient.users.delete({ id: user.db.auth_id! });
}
