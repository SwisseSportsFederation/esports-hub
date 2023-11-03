import styles from 'react-image-crop/dist/ReactCrop.css'
import { useLoaderData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { zx } from 'zodix';
import { z } from "zod";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import dateInputStyles from "~/styles/date-input.css";
import { createFlashMessage } from "~/services/toast.server";
import { AccessRight, EntityType, Group, RequestStatus, VerificationLevel } from "@prisma/client";
import { AuthUser } from '~/services/auth.server';

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

const createTeam = async (handle: string, name: string, description: string, game: number, user: AuthUser) => {
  const team = await db.group.create({
    data: {
      handle,
      name,
      description,
      group_type: EntityType.TEAM,
      game: {
        connect: {
          id: game
        }
      },
    }
  });
  await db.groupMember.create({
    data: {
      access_rights: AccessRight.ADMINISTRATOR,
      is_main_group: false,
      request_status: RequestStatus.ACCEPTED,
      joined_at: new Date(),
      role: "Admin",
      user: { connect: { id: BigInt(user.db.id) } },
      group: { connect: { id: team.id } }
    }
  })
  return String(team.id);
}

export const action = async ({ request }: ActionArgs) => {
  let { id, handle, founded, name, game, description, canton, languages } = await zx.parseForm(request, {
    id: z.string(),
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

  id = await createTeam(handle, name, description, game, user);

  await db.group.update({
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

  const headers = await createFlashMessage(request, 'Team created');
  return redirect(`/admin/team/${handle}/details`, headers);
};

export async function loader() {
  const accessRight = AccessRight.ADMINISTRATOR;
  const team: Group = {
    id: BigInt(0),
    name: "",
    handle: "",
    description: "",
    founded: new Date(),
    image: null,
    canton_id: null,
    game_id: BigInt(0),
    group_type: EntityType.TEAM,
    street: null,
    zip: null,
    verification_level: VerificationLevel.NOT_VERIFIED,
    is_active: true
  };
  return json({
    searchParams: await getSearchParams(),
    team,
    accessRight
  });
}

export default function() {
  const { searchParams, team } = useLoaderData<typeof loader>();
  return <EntityDetailBlock {...team} canton={null} languages={[]} entityId={team.id} entityType='TEAM'
                            entityBirthday={team.founded}
                            imageId={team.image} searchParams={searchParams}/>
}
