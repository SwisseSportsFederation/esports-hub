import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { OrganisationWithAccessRights } from "~/routes/admin/organisation/$handle";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { handle } = params;

  await checkUserAuth(request);

  const socials = await db.social.findMany({
    where: {
      organisation: {
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
  const { organisation } = useOutletContext<{ organisation: OrganisationWithAccessRights }>();
  const { socials } = useLoaderData();

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={'..'}>Socials</H1Nav>
      <SocialSelect id={Number(organisation.organisation.id)} entityType='ORG' socials={socials}/>
    </div>
  </div>;
};
