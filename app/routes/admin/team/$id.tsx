import { Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { AccessRight, Team } from "@prisma/client";

export type TeamWithAccessRights = {
  access_rights: AccessRight,
  team: Team
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  const user = await checkUserAuth(request);
  const team = await db.teamMember.findFirst({
    where: {
      user_id: Number(user.db.id),
      team_id: Number(id)
    },
    select: {
      access_rights: true,
      team: true
    }
  });
  if(!team || team.access_rights === 'NONE' || team.access_rights === 'MEMBER') {
    throw redirect('/admin')
  }
  return json<TeamWithAccessRights>(team);
};

export default function() {
  const team  = useLoaderData();

  return <Outlet context={{ team }}/>;
}
