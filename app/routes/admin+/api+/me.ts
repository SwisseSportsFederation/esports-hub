import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { db } from "~/services/db.server";
import { checkUserAuth } from '~/utils/auth.server';

/* This endpoint is for external in SSO cases. So the external provider can get basic information. */

export let loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);

  if (!user.db.auth_id) {
    throw json({}, 500);
  }

  try {
    const userData = await db.user.findMany({
      where: {
        id: user.db.id
      },
      select: {
        name: true,
        surname: true,
        handle: true,
        email: true,
        games: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    return json({ user: userData });
  } catch (error: any) {
    console.log(error);
    return json({ toast: `Error getting user: ${error.message ?? ''}` }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  throw json({}, 404);
};
