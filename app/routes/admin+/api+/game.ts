import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { zx } from 'zodix';
import { db } from "~/services/db.server";
import { checkSuperAdmin, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if (request.method === 'POST') {
    return postAction(request)
  }
  return json({}, 404);
};

const postAction = async (request: Request) => {
  const result = await zx.parseFormSafe(request, {
    name: z.string()
  });
  if (!result.success) {
    return json(result.error, 400);
  }

  const { name } = result.data;

  const user = await checkUserAuth(request);
  const isSuperAdmin = await checkSuperAdmin(user.db.id, false);

  try {
    const game = await db.game.create({
      data: {
        name,
        is_active: isSuperAdmin
      }
    });
    if (!isSuperAdmin) {
      await db.user.update({
        where: {
          id: BigInt(user.db.id)
        },
        data: {
          games: {
            connect: {
              id: game.id
            },
          }
        }
      })
    }
  } catch (error) {
    console.log(error);
    return json({ error }, 500);
  }

  let headers;
  if (isSuperAdmin) {
    return json({ toast: 'Game added' });
  } else {
    return json({ toast: 'Game Request sent' });
  }
}
