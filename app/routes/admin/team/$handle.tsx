import { Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { AccessRight, Team } from "@prisma/client";
import { zx } from "zodix";
import { z } from "zod";

export type TeamWithAccessRights = {
  accessRight: AccessRight,
  team: Team
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  const accessRight = await checkHandleAccessForEntity(user, handle, 'TEAM', 'MODERATOR')
  const team = await db.team.findFirst({
    where: {
      handle
    },
    include: {
      game: true,
      canton: true,
      languages: true,
    }
  });
  if(!team) {
    throw redirect('/admin');
  }
  return json<TeamWithAccessRights>({ team, accessRight });
};

export default function() {
  const team  = useLoaderData();

  return <Outlet context={{ team }}/>;
}
