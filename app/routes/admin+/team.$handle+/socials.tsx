import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { json, useLoaderData, useOutletContext } from "@remix-run/react";
import type { loader as handleLoader } from "~/routes/admin+/team/$handle";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/server-runtime";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  await checkUserAuth(request);

  const socials = await db.social.findMany({
    where: {
      group: {
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

export default function () {
  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  const { socials } = useLoaderData<typeof loader>();

  return <div>
    <div className="w-full max-w-prose mx-auto lg:mx-0">
      <H1Nav path={`..`} title='Socials' />
      <SocialSelect id={Number(team.id)} entityType={team.group_type} socials={socials} />
    </div>
  </div>;
};
