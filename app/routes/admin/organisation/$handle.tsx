import { Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { AccessRight, Organisation, VerificationLevel } from "@prisma/client";

export async function loader({ request, params }: LoaderFunctionArgs) {

  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  if(handle === "0") {
    const accessRight = AccessRight.ADMINISTRATOR;
    const organisation: Organisation = {
      id: BigInt(0),
      name: "",
      handle: "",
      description: "",
      founded: new Date(),
      image: null,
      street: null,
      zip: null,
      canton_id: null,
      verification_level: VerificationLevel.NOT_VERIFIED,
      is_active: true
    };
    return json({ organisation, accessRight });
  } else {
    const accessRight = await checkHandleAccessForEntity(user, handle, 'ORG', 'MODERATOR')
    const organisation = await db.organisation.findFirst({
      where: {
        handle
      },
      include: {
        canton: true,
        languages: true,
      }
    });
    if(!organisation) {
      throw redirect('/admin')
    }
    return json({ organisation, accessRight });
  }
}


export default function() {
  const organisation = useLoaderData<typeof loader>();
  return <Outlet context={organisation}/>;
}
