import { Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { AccessRight, Organisation } from "@prisma/client";

export type OrganisationWithAccessRights = {
  access_rights: AccessRight,
  organisation: Organisation
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const user = await checkUserAuth(request);
  const team = await db.organisationMember.findFirst({
    where: {
      user_id: Number(user.db.id),
      entity_id: Number(id)
    },
    select: {
      access_rights: true,
      organisation: true
    }
  });
  if(!team || team.access_rights === 'NONE' || team.access_rights === 'MEMBER') {
    throw redirect('/admin')
  }
  return json<OrganisationWithAccessRights>(team);
};

export default function() {
  const organisation  = useLoaderData();

  return <Outlet context={{ organisation }}/>;
}
