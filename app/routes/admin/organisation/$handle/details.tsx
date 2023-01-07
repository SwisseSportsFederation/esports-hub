import styles from 'react-image-crop/dist/ReactCrop.css'
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { loader as handleLoader } from "~/routes/admin/organisation/$handle";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { z } from "zod";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import { SerializeFrom } from "@remix-run/server-runtime";
import { zx } from "zodix";
import dateInputStyles from "~/styles/date-input.css";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export const action = async ({ request }: ActionArgs) => {
  const { id, oldHandle, founded, handle, name, description, street, zip, canton, languages } = await zx.parseForm(request, {
    id: z.string(),
    oldHandle: z.string(),
    handle: z.string().min(3),
    name: z.string().min(3),
    founded: z.string().optional(),
    street: z.string().optional(),
    zip: z.string().optional(),
    description: z.string().optional(),
    canton: zx.NumAsString.optional(),
    languages: z.string()
  });
  const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));

  const user = await checkUserAuth(request);
  await checkHandleAccessForEntity(user, oldHandle, 'ORG', 'MODERATOR');

  console.log(founded);

  await db.organisation.update({
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
  return redirect(`/admin/organisation/${handle}/details`);

  /* TODO: Handle Errors */
  /*
  if (error) {
    addNotification("Error", 3000);
    console.error(error);
    return;
  }

  addNotification("Success", 3000);
  */
};

export async function loader() {
  return json({
    searchParams: await getSearchParams()
  });
}

export default function() {
  const { searchParams } = useLoaderData<typeof loader>();
  const { organisation } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  console.log(organisation.founded);
  return <EntityDetailBlock {...organisation} entityId={organisation.id} entityType='ORG'
                            entityBirthday={organisation.founded} imageId={organisation.image}
                            searchParams={searchParams}/>;
}
