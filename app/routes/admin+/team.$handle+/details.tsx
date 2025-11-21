import styles from 'react-image-crop/dist/ReactCrop.css?url';
import { json, redirect, useLoaderData, useOutletContext } from '@remix-run/react';
import type { loader as handleLoader } from '~/routes/admin+/team.$handle+/admin.team.$handle';
import type { ActionFunctionArgs } from '@remix-run/node';
import { checkHandleAccessForEntity, checkUserAuth } from '~/utils/auth.server';
import { db } from '~/services/db.server';
import { getSearchParams } from '~/services/search.server';
import { zx } from 'zodix';
import { z } from 'zod';
import EntityDetailBlock from '~/components/Blocks/EntityDetailBlock';
import type { SerializeFrom } from '@remix-run/server-runtime';
import dateInputStyles from '~/styles/date-input.css?url';
import { createFlashMessage } from '~/services/toast.server';
import { ToastMessageListener } from '~/components/Notifications/ToastMessageListener';

export function links() {
  return [
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: dateInputStyles },
  ];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { id, oldHandle, handle, founded, name, game, description, canton, languages } = await zx.parseForm(request, {
    id: z.string(),
    oldHandle: z.string(),
    handle: z.string().min(2),
    name: z.string().min(3),
    founded: z.string().optional(),
    game: zx.NumAsString,
    description: z.string(),
    canton: zx.NumAsString.optional(),
    languages: z.string(),
  });
  const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));
  const user = await checkUserAuth(request);
  await checkHandleAccessForEntity(user.db.id, oldHandle, 'MODERATOR');

  let headers
  try {
    await db.group.update({
      where: {
        id: Number(id),
      },
      data: {
        handle,
        name,
        description,
        ...(founded && ({ founded: new Date(founded) })),
        ...(!founded && ({ founded: null })),
        game: {
          connect: {
            id: Number(game),
          },
        },
        ...(canton && {
          canton: {
            connect: {
              id: canton,
            },
          },
        }),
        ...(!canton && {
          canton: {
            disconnect: true,
          },
        }),
        languages: {
          set: languageIds,
        },
      },
    });
    headers = await createFlashMessage(request, 'Team update is done');
    return redirect(`/admin/team/${handle}/details`, headers);
  } catch (error: any) {
    if (error.message.includes('handle')) {
      headers = await createFlashMessage(request, 'Error updating team: Short name already taken.');
    } else {
      headers = await createFlashMessage(request, 'Error updating team: ' + error.message);
    }
    return redirect(`/admin/team/${oldHandle}/details`, headers);
  }

};

export async function loader() {
  return json({
    searchParams: await getSearchParams(),
  });
}

export default function () {
  const { searchParams } = useLoaderData<typeof loader>();
  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>();

  return <>
    <EntityDetailBlock {...team} entityId={team.id} entityType="TEAM" entityBirthday={team.founded}
      imageId={team.image} searchParams={searchParams} />
    <ToastMessageListener />
  </>;
}
