import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { zx } from 'zodix';
import { z } from "zod";
import { checkSuperAdmin, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { createFlashMessage } from "~/services/toast.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method === 'POST') {
    return postAction(request)
  }
  return json({}, 404);
};

const postAction = async (request: Request) => {
  const result = await zx.parseFormSafe(request, {
	userId: zx.NumAsString,
    name: z.string()
  });
  if(!result.success) {
    return json(result.error, 400);
  }

  const { userId, name } = result.data;

  const user = await checkUserAuth(request);
  const isSuperAdmin = await checkSuperAdmin(user.db.id, false);

  try {
    const game = await db.game.create({
		data: {
			name,
			is_active: isSuperAdmin
		}
	});
	if(!isSuperAdmin) {
		await db.user.update({
			where: {
				id: userId
			},
			// TODO: Test if game is added to the user when submitted over normal admin panel.
			data: {
				games: {
					push: [{...game}],
				}
			}
		})
	}
  } catch(error) {
    console.log(error);
    return json({ error }, 500);
  }

  let headers;
  if(isSuperAdmin) {
	headers = await createFlashMessage(request, 'Game added');
  } else {
	headers = await createFlashMessage(request, 'Game Request sent');
  }
  return json({}, headers);
}
