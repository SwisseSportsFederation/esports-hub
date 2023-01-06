import { Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { AccessRight, Organisation } from "@prisma/client";
import { zx } from "zodix";
import { z } from "zod";

export type OrganisationWithAccessRights = {
  accessRight: AccessRight,
  organisation: Organisation
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  const user = await checkUserAuth(request);
  const accessRight = await checkHandleAccessForEntity(user, handle, 'ORG', 'MODERATOR')
  const organisation = await db.organisation.findFirst({
    where: {
        handle
    }
  });
  if(!organisation) {
    throw redirect('/admin')
  }
  return json<OrganisationWithAccessRights>({ organisation, accessRight });
};

export default function() {
  const organisation  = useLoaderData();

  return <Outlet context={{ organisation }}/>;
}
