import styles from 'react-image-crop/dist/ReactCrop.css'
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { loader as handleLoader } from "~/routes/admin/team/$handle";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { zx } from 'zodix';
import { z } from "zod";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import { SerializeFrom } from "@remix-run/server-runtime";
import dateInputStyles from "~/styles/date-input.css";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export const action = async ({ request }: ActionArgs) => {
  const { id, oldHandle, handle, founded, name, game, description, canton, languages } = await zx.parseForm(request, {
    id: z.string(),
    oldHandle: z.string(),
    handle: z.string().min(3),
    name: z.string().min(3),
    founded: z.string().optional(),
    game: zx.NumAsString,
    description: z.string().optional(),
    canton: zx.NumAsString.optional(),
    languages: z.string()
  });
  const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));
  const user = await checkUserAuth(request);
  await checkHandleAccessForEntity(user, oldHandle, 'TEAM', 'MODERATOR');
  await db.team.update({
    where: {
      id: Number(id)
    },
    data: {
      handle,
      name,
      description,
      ...(founded && ({ founded: new Date(founded) })),
      ...(!founded && ({ founded: null })),
      game: {
        connect: {
          id: Number(game)
        }
      },
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
  return redirect(`/admin/team/${handle}/details`, {
    status: 301
  });

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
  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>();

  return <EntityDetailBlock {...team} entityId={team.id} entityType='TEAM' entityBirthday={team.founded}
                            imageId={team.image} searchParams={searchParams}/>
}
