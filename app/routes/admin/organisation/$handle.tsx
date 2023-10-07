import { Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ request, params }: LoaderFunctionArgs) {

  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  const accessRight = await checkHandleAccessForEntity(user.db.id, handle, 'MODERATOR')
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


export default function() {
  const organisation = useLoaderData<typeof loader>();
  return <Outlet context={organisation}/>;
}
