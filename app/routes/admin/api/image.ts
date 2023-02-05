import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { deleteImage, resize, upload } from "~/services/admin/api/cloudflareImages.server";
import { db } from "~/services/db.server";
import { StringOrNull } from "~/db/queries.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method === 'PUT') {
    return putAction(request)
  }
  if(request.method === 'DELETE') {
    return deleteAction(request);
  }
  return json({}, 404);
};

const deleteAction = async (request: Request) => {
  const { entityId, entity, imageId } = await zx.parseForm(request, {
    entityId: zx.NumAsString,
    imageId: z.string(),
    entity: z.enum(["USER", "TEAM", "ORG"])
  });

  const user = await checkUserAuth(request);
  if(entity !== 'USER') {
    await checkIdAccessForEntity(user.db.id, entityId, entity, 'ADMINISTRATOR');
  }
  try {
    const checkQuery = {
      where: {
        id: entityId
      }
    };
    let result;
    if(entity === 'USER') {
      result = await db.user.findFirstOrThrow(checkQuery);
    } else if(entity === 'TEAM') {
      result = await db.team.findFirstOrThrow(checkQuery);
    } else if(entity === 'ORG') {
      result = await db.organisation.findFirstOrThrow(checkQuery);
    }

    if(result?.image === null || result?.image !== imageId) {
      return json({}, 400);
    }
    await deleteImage(imageId);

    const updateQuery = {
      where: {
        id: entityId
      },
      data: {
        image: null
      }
    };
    if(entity === 'USER') {
      await db.user.update(updateQuery)
    } else if(entity === 'TEAM') {
      await db.team.update(updateQuery)
    } else if(entity === 'ORG') {
      await db.organisation.update(updateQuery)
    }


  } catch(error) {
    console.log(error);
    return json({}, 500);
  }
  return json({});
};

const putAction = async (request: Request) => {
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
    await checkIdAccessForEntity(user.db.id, entityId, entity, 'ADMINISTRATOR');
  }
  try {
    const existingImageQuery = {
      where: {
        id: entityId
      },
      select: {
        image: true
      }
    };
    let image: { image: StringOrNull } = { image: null };
    if(entity === 'USER') {
      image = await db.user.findFirstOrThrow(existingImageQuery)
    } else if(entity === 'TEAM') {
      image = await db.team.findFirstOrThrow(existingImageQuery)
    } else if(entity === 'ORG') {
      image = await db.organisation.findFirstOrThrow(existingImageQuery)
    }

    await deleteImage(image.image);
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
}
