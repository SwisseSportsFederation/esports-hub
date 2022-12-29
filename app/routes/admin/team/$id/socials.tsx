import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { TeamWithAccessRights } from "~/routes/admin/team/$id";
import { json, LoaderFunction } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);

  const socials = await db.social.findMany({
    where: {
      user_id: Number(user.db.id)
    }
  })

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
