import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@vercel/remix";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { SocialPlatform } from "@prisma/client";
import { db } from "~/services/db.server";
import { createFlashMessage } from "~/services/toast.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method !== "POST") {
    return json({}, 404);
  }

  const zSocials = Object.values(SocialPlatform)
    .map(social => social.toLowerCase())
    .reduce((prev, current) => ({
      ...prev,
      [current]: z.string().min(3, { message: `${current} handle must be at least 3 characters long` }).optional()
    }), {});
  const result = await zx.parseFormSafe(request, {
    entityId: zx.NumAsString,
    entity: z.enum(["USER", "TEAM", "ORGANISATION"]),
    ...zSocials
  });
  if(!result.success) {
    return json(result.error, 400);
  }

  const { entityId, entity, ...socials } = result.data;

  const user = await checkUserAuth(request);
  if(entity !== 'USER') {
    await checkIdAccessForEntity(user.db.id, entityId, 'MODERATOR');
  }

  const entityIdName = entity === 'USER' ? 'user_id' : 'group_id';

  const data = Object.entries(socials as { [key: string]: string }).map(entry => ({
    [entityIdName]: entityId,
    name: entry[1],
    platform: entry[0].toUpperCase() as SocialPlatform
  }))
  try {
    await db.$transaction([
      db.social.deleteMany({
        where: {
          [entityIdName]: entityId
        }
      }),
      db.social.createMany({
        data
      })
    ]);
  } catch(error) {
    console.log(error);
    return json({ error }, 500);
  }

  const headers = await createFlashMessage(request, 'Socials updated successfully');
  return json({}, headers);
};
