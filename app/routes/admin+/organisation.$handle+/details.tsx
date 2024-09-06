import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect, useLoaderData, useOutletContext } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/server-runtime";
import styles from 'react-image-crop/dist/ReactCrop.css?url';
import { z } from "zod";
import { zx } from "zodix";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import type { loader as handleLoader } from "~/routes/admin+/organisation/$handle";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { createFlashMessage } from "~/services/toast.server";
import dateInputStyles from "~/styles/date-input.css?url";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    id,
    oldHandle,
    founded,
    handle,
    name,
    description,
    street,
    zip,
    canton,
    languages
  } = await zx.parseForm(request, {
    id: z.string(),
    oldHandle: z.string(),
    handle: z.string().min(3),
    name: z.string().min(3),
    founded: z.string().optional(),
    street: z.string().optional(),
    zip: z.string().optional(),
    description: z.string(),
    canton: zx.NumAsString.optional(),
    languages: z.string()
  });
  const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));

  const user = await checkUserAuth(request);

  await checkHandleAccessForEntity(user.db.id, oldHandle, 'MODERATOR');

  let headers
  try {

    await db.group.update({
      where: {
        id: Number(id)
      },
      data: {
        handle,
        name,
        description,
        street,
        ...(founded && ({ founded: new Date(founded) })),
        ...(!founded && ({ founded: null })),
        zip,
        ...(canton && {
          canton: {
            connect: {
              id: canton
            }
          }
        }),
        ...(!canton && {
          canton: {
            disconnect: true
          }
        }),
        languages: {
          set: languageIds
        }
      }
    });
    headers = await createFlashMessage(request, 'Organisation update is done');
    return redirect(`/admin/organisation/${handle}/details`, headers);
  } catch (error: any) {
    if (error.message.includes('handle')) {
      headers = await createFlashMessage(request, 'Error updating organisation: Short name already taken.');
    } else {
      headers = await createFlashMessage(request, 'Error updating organisation: ' + error.message);
    }
    return redirect(`/admin/organisation/${oldHandle}/details`, headers);
  }
};

export async function loader() {
  return json({
    searchParams: await getSearchParams()
  });
}

export default function () {
  const { searchParams } = useLoaderData<typeof loader>();
  const { organisation } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  return <EntityDetailBlock {...organisation} entityId={organisation.id} entityType='ORGANISATION'
    entityBirthday={organisation.founded} imageId={organisation.image}
    searchParams={searchParams} />;
}
