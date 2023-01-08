import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { loader as handleLoader } from "~/routes/admin/team/$handle";
import { json } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import { SerializeFrom } from "@remix-run/server-runtime";
import { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  await checkUserAuth(request);

  const socials = await db.social.findMany({
    where: {
      team: {
        handle
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  return json({
    socials
  });
}

export default function() {
  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  const { socials } = useLoaderData<typeof loader>();

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={`..`} title='Socials'/>
      <SocialSelect id={Number(team.id)} entityType='TEAM' socials={socials}/>
    </div>
  </div>;
};
