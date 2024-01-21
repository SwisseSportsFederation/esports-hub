import { AccessRight, EntityType, Group, VerificationLevel } from "@prisma/client";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import styles from 'react-image-crop/dist/ReactCrop.css';
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import { action as apiAction } from '~/routes/admin.api.team';
import { getSearchParams } from "~/services/search.server";
import dateInputStyles from "~/styles/date-input.css";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export const action = async (args: DataFunctionArgs) => {
  return apiAction(args);
}

export async function loader() {
  const accessRight = AccessRight.ADMINISTRATOR;
  const team: Group = {
    id: BigInt(0),
    name: "",
    handle: "",
    description: "",
    founded: new Date(),
    image: null,
    street: null,
    zip: null,
    canton_id: null,
    game_id: BigInt(0),
    group_type: EntityType.TEAM,
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
