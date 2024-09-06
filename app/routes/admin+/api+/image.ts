import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { zx } from 'zodix';
import { StringOrNull } from "~/db/queries.server";
import { deleteImage, resize, upload } from "~/services/admin/api/cloudflareImages.server";
import { db } from "~/services/db.server";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if (request.method === 'PUT') {
    return putAction(request)
  }
  if (request.method === 'DELETE') {
    return deleteAction(request);
  }
  return json({}, 404);
};

const deleteAction = async (request: Request) => {
  const { entityId, entity, imageId } = await zx.parseForm(request, {
    entityId: zx.NumAsString,
    imageId: z.string(),
    entity: z.enum(["USER", "TEAM", "ORGANISATION"])
  });

  const user = await checkUserAuth(request);
  if (entity !== 'USER') {
    await checkIdAccessForEntity(user.db.id, entityId, 'ADMINISTRATOR');
  }
  try {
    const checkQuery = {
      where: {
        id: entityId
      }
    };
    let result;
    if (entity === 'USER') {
      result = await db.user.findFirstOrThrow(checkQuery);
    } else {
      result = await db.group.findFirstOrThrow(checkQuery);
    }

    if (result?.image === null || result?.image !== imageId) {
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
    if (entity === 'USER') {
      await db.user.update(updateQuery)
    } else {
      await db.group.update(updateQuery)
    }


  } catch (error) {
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
    entity: z.enum(["USER", "TEAM", "ORGANISATION"])
  });
  const cropData = JSON.parse(crop);
  const user = await checkUserAuth(request);
  if (entity !== 'USER') {
    await checkIdAccessForEntity(user.db.id, entityId, 'ADMINISTRATOR');
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
    let image: { image: StringOrNull };
    if (entity === 'USER') {
      image = await db.user.findFirstOrThrow(existingImageQuery)
    } else {
      image = await db.group.findFirstOrThrow(existingImageQuery)
    }

    await deleteImage(image.image);
    const buffer = Buffer.from(await file.arrayBuffer())
    const croppedImage = await resize(buffer, cropData);
    const { result } = await upload(croppedImage, 'image-' + entityId);
    const query = {
      where: {
        id: entityId
      },
      data: {
        image: result.id
      }
    };

    if (entity === 'USER') {
      await db.user.update(query)
    } else {
      await db.group.update(query)
    }
  } catch (error) {
    console.log(error);
    return json({}, 500);
  }
  return json({});
}
