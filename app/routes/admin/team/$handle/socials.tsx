import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { TeamWithAccessRights } from "~/routes/admin/team/$handle";
import { json, LoaderFunction } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";

export const loader: LoaderFunction = async ({ request, params }) => {
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
};

export default function() {
  const { team } = useOutletContext<{ team: TeamWithAccessRights }>();
  const { socials } = useLoaderData();

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={`..`}>Socials</H1Nav>
      <SocialSelect id={Number(team.team.id)} entityType='TEAM' socials={socials}/>
    </div>
  </div>;
};
