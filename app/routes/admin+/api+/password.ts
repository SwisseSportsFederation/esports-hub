import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@vercel/remix';
import { checkUserAuth } from '~/utils/auth.server';
import { AuthenticationClient } from 'auth0';
import * as process from 'process';
import { createFlashMessage } from '~/services/toast.server';

export let loader: LoaderFunction = () => redirect('/admin');

export const action: ActionFunction = async ({request}) => {
  if (request.method !== 'POST') {
    throw json({}, 404);
  }
  const user = await checkUserAuth(request);

  if (!user.db.auth_id) {
    throw json({}, 500);
  }

  try {
    const client = new AuthenticationClient({
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
    });

    await client.database.changePassword({
      email: user.db.email,
      client_id: process.env.AUTH0_CLIENT_ID,
      connection: process.env.AUTH0_CONNECTION,
    });

    const headers = await createFlashMessage(request, 'A Password reset email was sent!');

    return json({}, {status: 200, ...headers});
  } catch (error) {
    console.log(error);
    throw json({}, 500);
  }
};
