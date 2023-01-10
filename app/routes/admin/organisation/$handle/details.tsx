import styles from 'react-image-crop/dist/ReactCrop.css'
import { useLoaderData, useOutletContext } from "@remix-run/react";
import type { loader as handleLoader } from "~/routes/admin/organisation/$handle";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { z } from "zod";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { zx } from "zodix";
import dateInputStyles from "~/styles/date-input.css";
import { createFlashMessage } from "~/services/toast.server";
import { AccessRight, RequestStatus } from '@prisma/client';
import { AuthUser } from '~/services/auth.server';

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

const createOrganisation = async (handle: string, name: string, description: string, user: AuthUser) => {
  const organisation = await db.organisation.create({
    data: {
      handle,
      name,
      description
    }
  });
  await db.organisationMember.create({
    data: {
      access_rights: AccessRight.ADMINISTRATOR,
      is_main_organisation: false,
      request_status: RequestStatus.ACCEPTED,
      joined_at: new Date(),
      role: "Admin",
      user: { connect: { id: BigInt(user.db.id) }},
      organisation: { connect: { id: organisation.id }}
    }
  })
  return organisation.id.toString();
}

export const action = async ({ request }: ActionArgs) => {
  let {
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

  let toastMessage = 'Organisation update is done';
  if(id === "0") {
    id = await createOrganisation(handle, name, description, user);
    toastMessage = 'Organisation created';
  } else {
    await checkHandleAccessForEntity(user, oldHandle, 'ORG', 'MODERATOR');
  }

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

  const headers = await createFlashMessage(request, toastMessage);

  return redirect(`/admin/organisation/${handle}/details`, headers);
};

export async function loader() {
  return json({
    searchParams: await getSearchParams()
  });
}

export default function() {
  const { searchParams } = useLoaderData<typeof loader>();
  const { organisation } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  return <EntityDetailBlock {...organisation} entityId={organisation.id} entityType='ORG'
                            entityBirthday={organisation.founded} imageId={organisation.image}
                            searchParams={searchParams}/>;
}
