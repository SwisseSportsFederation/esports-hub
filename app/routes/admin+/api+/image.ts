import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { zx } from 'zodix';
import { deleteImage, upload } from "~/services/admin/api/imageStore.server";
import { checkUserAuth } from "~/utils/auth.server";

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
  const { imageId } = await zx.parseForm(request, {
    imageId: z.string()
  });

  // Check logged in
  await checkUserAuth(request);
  try {
    await deleteImage(imageId);
  } catch (error) {
    console.log(error);
    return json({}, 500);
  }
  return json({});
};

const putAction = async (request: Request) => {
  const form = await request.clone().formData();
  const file = form.get('file') as File;
  const { path } = await zx.parseForm(request, {
    path: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const { result } = await upload(file, path + 'image-misc-' + randomUUID());
    return json(result);
  } catch (error) {
    console.log(error);
    return json({}, 500);
  }
  return json({});
}
