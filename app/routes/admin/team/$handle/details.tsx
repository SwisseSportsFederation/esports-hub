import styles from 'react-image-crop/dist/ReactCrop.css'
import { useLoaderData, useOutletContext } from "@remix-run/react";
import type { loader as handleLoader } from "~/routes/admin/team/$handle";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { zx } from 'zodix';
import { z } from "zod";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import type { SerializeFrom } from "@remix-run/server-runtime";
import dateInputStyles from "~/styles/date-input.css";
import { createFlashMessage } from "~/services/toast.server";
import { AccessRight, Team, RequestStatus } from "@prisma/client";
import { AuthUser } from '~/services/auth.server';

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

const createTeam = async (handle: string, name: string, description: string, game: number, user: AuthUser) => {
  const team = await db.team.create({
    data: {
      handle,
      name,
      description,
      game: {
        connect: {
          id: game
        }
      },
    }
  });
  await db.teamMember.create({
    data: {
      access_rights: AccessRight.ADMINISTRATOR,
      is_main_team: false,
      request_status: RequestStatus.ACCEPTED,
      joined_at: new Date(),
      role: "Admin",
      user: { connect: { id: BigInt(user.db.id) }},
      team: { connect: { id: team.id }}
    }
  })
  return team.id.toString();
}

export const action = async ({ request }: ActionArgs) => {
  let { id, oldHandle, handle, founded, name, game, description, canton, languages } = await zx.parseForm(request, {
    id: z.string(),
    oldHandle: z.string(),
    handle: z.string().min(3),
    name: z.string().min(3),
    founded: z.string().optional(),
    game: zx.NumAsString,
    description: z.string(),
    canton: zx.NumAsString.optional(),
    languages: z.string()
  });
  const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));
  const user = await checkUserAuth(request);

  let toastMessage = 'Team update is done';
  if(id === "0") {
    id = await createTeam(handle, name, description, game, user);
    toastMessage = 'Team created';
  } else {
    await checkHandleAccessForEntity(user, oldHandle, 'TEAM', 'MODERATOR');
  }

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
  
  const headers = await createFlashMessage(request, toastMessage);
  return redirect(`/admin/team/${handle}/details`, headers);
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
