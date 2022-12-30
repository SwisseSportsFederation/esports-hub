import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { zx } from 'zodix';
import { z } from "zod";
import { checkAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { resize, upload } from "~/services/admin/api/cloudflareImages.server";
import { db } from "~/services/db.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method !== "PUT") {
    return json({}, 404);
  }
  const form = await request.clone().formData();
  const file = form.get('file') as File;
  const { entityId, entity, crop } = await zx.parseForm(request, {
    entityId: zx.NumAsString,
    crop: z.string(),
    entity: z.enum(["USER", "TEAM", "ORG"])
  });
  const cropData = JSON.parse(crop);
  const user = await checkUserAuth(request);
  if(entity !== 'USER') {
    await checkAccessForEntity(user, entityId, entity, 'ADMINISTRATOR');
  }
  try {
    const croppedImage = await resize(file, cropData);
    const { result } = await upload(croppedImage);

    const query = {
      where: {
        id: entityId
      },
      data: {
        image: result.id
      }
    };

    if(entity === 'USER') {
      await db.user.update(query)
    } else if(entity === 'TEAM') {
      await db.team.update(query)
    } else if(entity === 'ORG') {
      await db.organisation.update(query)
    }
  } catch(error) {
    console.log(error);
    return json({}, 500);
  }
  return json({});
};
