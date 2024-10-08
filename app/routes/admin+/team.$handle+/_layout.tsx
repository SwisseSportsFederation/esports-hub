import { Outlet, useLoaderData } from "@remix-run/react";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/server-runtime";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);

  const accessRight = await checkHandleAccessForEntity(user.db.id, handle, 'MODERATOR')
  const team = await db.group.findFirst({
    where: {
      handle
    },
    include: {
      game: true,
      canton: true,
      languages: true,
    }
  });
  if (!team) {
    throw redirect('/admin');
  }
  return json({ team, accessRight });
}

export default function () {
  const team = useLoaderData<typeof loader>();

  return <Outlet context={team} />;
}
