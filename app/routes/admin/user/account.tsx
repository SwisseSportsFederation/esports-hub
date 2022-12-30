import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import styles from 'react-image-crop/dist/ReactCrop.css'
import { json, LoaderFunction } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { User } from "@prisma/client";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);
  const userData = await db.user.findFirst({
    where: {
      id: Number(user.db.id)
    }
  })
  return json({ user: userData });
}

export default function() {
  const { user } = useLoaderData<{ user: User }>();
  return <ImageUploadBlock entityId={Number(user.id)} entity={'USER'} imageId={user.image}/>;
}
