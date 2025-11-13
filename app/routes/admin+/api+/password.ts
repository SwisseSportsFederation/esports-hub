import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { AuthenticationClient } from 'auth0';
import * as process from 'process';
import { checkUserAuth } from '~/utils/auth.server';

export let loader: LoaderFunction = () => redirect('/admin');

export const action: ActionFunction = async ({ request }) => {
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

    return json({ toast: 'A Password reset email was sent!' }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw json({ toast: `Error sending password reset email: ${error.message ?? ''}` }, 500);
  }
};
