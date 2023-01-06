import { useLoaderData } from "@remix-run/react";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { json } from "@remix-run/node";
import { getOrganisationMemberTeasers, getTeamTeasers } from "~/utils/teaserHelper";
import TeaserList from "~/components/Teaser/TeaserList";
import ActionButton from "~/components/Button/ActionButton";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import { getOrganisationGames, isOrganisationMember } from "~/utils/entityFilters";
import { RequestStatus } from "@prisma/client";
import { zx } from "zodix";
import { z } from "zod";
import { LoaderFunctionArgs } from "@remix-run/router";
import { useEffect, useState } from "react";

// const { addNotification } = useNotification(); // TODO add notification logic

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedIn = await isLoggedIn(request);
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  /* TODO check query */
  const organisation = await db.organisation.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      socials: true,
      teams: { include: { game: true } },
      members: {
        where: {
          request_status: RequestStatus.ACCEPTED
        },
        include: { user: { include: { games: true } } }
      }
    }
  }).catch(() => {
    throw new Response("Not Found", {
      status: 404,
    })
  });

  let showApply = false;
  if (loggedIn) {
    const user = await checkUserAuth(request);
    showApply = !isOrganisationMember(organisation.members, Number(user.db.id));
  }

  const result = {
    organisation,
    showApply
  }

  return json(result);
}

export default function() {
  const { organisation, showApply } = useLoaderData<typeof loader>();
  const [teasers, setTeasers] = useState({
    memberTeasers: getOrganisationMemberTeasers(organisation.members),
    teamTeasers: getTeamTeasers(organisation.teams)
  });

  useEffect(() => {
    const memberTeasers = getOrganisationMemberTeasers(organisation.members);
    const teamTeasers = getTeamTeasers(organisation.teams);
    setTeasers({ teamTeasers, memberTeasers })
  }, [organisation]);


  const handleActionClick = async () => {
    //addNotification("Error", 3000);
    /* TODO later apply button
    const [, error] = await authenticatedFetch(`/users/${user.profile.id}/organisation/apply`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: user.profile.id,
        organisationId: organisation.id,
        isMainTeam: false,
        joinedAt: new Date().toISOString(),
        role: ""
      })
    }, token);

    if (error) {
      addNotification("Error", 3000);
      console.error(error);
      return;
    }

    addNotification("Success", 3000);
    await mutate();*/
  };

  return <div className="mx-3">
    <div className="max-w-prose lg:max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <DetailHeader name={organisation.name}
                      imagePath={organisation.image}
                      entitySocials={organisation.socials}
                      games={getOrganisationGames(organisation)}
                      showApply={showApply}
                      onApply={handleActionClick}/>
        <div className="col-span-2 space-y-4">
          <DetailContentBlock {...organisation} />
          <div className="">
            <TeaserList title="Teams" teasers={teasers.teamTeasers}/>
            <TeaserList title="Members" teasers={teasers.memberTeasers}/>
          </div>
          {showApply &&
            <div className="flex items-center justify-center my-7">
              <ActionButton content="Apply" action={handleActionClick}/>
            </div>
          }
        </div>
      </div>
    </div>
  </div>;
};
