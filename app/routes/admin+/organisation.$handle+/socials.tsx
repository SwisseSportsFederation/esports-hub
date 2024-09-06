import type { LoaderFunction } from "@remix-run/node";
import { json, useLoaderData, useOutletContext } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { z } from "zod";
import { zx } from "zodix";
import SocialSelect from "~/components/SocialSelect";
import H1Nav from "~/components/Titles/H1Nav";
import type { loader as handleLoader } from "~/routes/admin+/organisation/$handle";
import { db } from "~/services/db.server";
import { checkUserAuth } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
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
};

export default function () {
  const { organisation } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  const { socials } = useLoaderData();

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={'..'} title='Socials' />
      <SocialSelect id={Number(organisation.id)} entityType='ORGANISATION' socials={socials} />
    </div>
  </div>;
};
