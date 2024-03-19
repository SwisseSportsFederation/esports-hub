import type { Group} from '@prisma/client';
import type { ActionFunctionArgs} from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import styles from 'react-image-crop/dist/ReactCrop.css?url';
import EntityDetailBlock from '~/components/Blocks/EntityDetailBlock';
import { action as apiAction } from '~/routes/admin.api.organisation';
import { getSearchParams } from '~/services/search.server';
import dateInputStyles from '~/styles/date-input.css?url';
import { AccessRightValue, EntityTypeValue, VerificationLevelValue } from '~/models/database.model';

export function links() {
  return [
    {rel: 'stylesheet', href: styles},
    {rel: 'stylesheet', href: dateInputStyles},
  ];
}

export const action = async (args: ActionFunctionArgs) => {
  return apiAction(args);
};

export async function loader() {
  const accessRight = AccessRightValue.ADMINISTRATOR;
  const organisation: Group = {
    id: BigInt(0),
    name: '',
    handle: '',
    description: '',
    founded: new Date(),
    image: null,
    street: null,
    zip: null,
    canton_id: null,
    game_id: null,
    group_type: EntityTypeValue.ORGANISATION,
    verification_level: VerificationLevelValue.NOT_VERIFIED,
    is_active: true,
  };
  return json({
    searchParams: await getSearchParams(),
    organisation,
    accessRight,
  });
}

export default function () {
  const {searchParams, organisation} = useLoaderData<typeof loader>();
  return <EntityDetailBlock {...organisation} canton={null} languages={[]} create={true} entityId={organisation.id}
                            entityType="ORGANISATION"
                            entityBirthday={organisation.founded} imageId={organisation.image}
                            searchParams={searchParams}/>;
}
