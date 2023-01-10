import { Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { z } from "zod";
import { AccessRight, Team, VerificationLevel } from "@prisma/client";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);

  if(handle === "0") {
    const accessRight = AccessRight.ADMINISTRATOR;
    const team: Team = {
      id: BigInt(0),
      name: "",
      handle: "",
      description: "",
      founded: new Date(),
      image: null,
      canton_id: null,
      game_id: BigInt(0),
      organisation_id: null,
      request_status: null,
      verification_level: VerificationLevel.NOT_VERIFIED,
      is_active: true
    };
    return json({ team, accessRight });
  } else {
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
    return json({ team, accessRight });
  }
}

export default function() {
  const team = useLoaderData<typeof loader>();

  return <Outlet context={team}/>;
}
