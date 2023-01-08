import { useLoaderData } from "@remix-run/react";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { json } from "@remix-run/node";
import { getTeamMemberTeasers } from "~/utils/teaserHelper";
import TeaserList from "~/components/Teaser/TeaserList";
import ActionButton from "~/components/Button/ActionButton";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import { isTeamMember } from "~/utils/entityFilters";
import { entityToPathSegment } from "~/helpers/entityType";
import { RequestStatus } from "@prisma/client";
import { zx } from "zodix";
import { z } from "zod";
import { LoaderFunctionArgs } from "@remix-run/router";

// const { addNotification } = useNotification(); // TODO add notification logic

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedIn = await isLoggedIn(request);
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  const team = await db.team.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      organisation: {
        include: {
          organisation: true
        }
      },
      game: true,
      members: {
        where: {
          request_status: RequestStatus.ACCEPTED
        },
        include: { user: { include: { games: true } } }
      },
      socials: true
    }
  }).catch(() => {
    throw new Response("Not Found", {
      status: 404,
    });
  });

  let showApply;
  if(loggedIn) {
    const user = await checkUserAuth(request);
    showApply = !isTeamMember(team.members, Number(user.db.id));
  } else {
    showApply = false;
  }
  const memberTeasers = getTeamMemberTeasers(team.name, team.members);
  return json({
    team,
    showApply,
    memberTeasers
  });
}

export default function() {
  const { team, showApply, memberTeasers } = useLoaderData<typeof loader>();

  const handleActionClick = async () => {
    //addNotification("Error", 3000);
    /* TODO later apply button
    const [, error] = await authenticatedFetch(`/users/${user.profile.id}/team/apply`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: user.profile.id,
        teamId: team.id,
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

  const orgHeaderProps = team.organisation ? {
    parentLink: `/detail/${entityToPathSegment('ORG')}/${team.organisation.organisation.handle}`,
    parentName: team.organisation.organisation.name
  } : {};

  return <div className="mx-3">
    <div className="max-w-prose lg:max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <DetailHeader name={team.name}
                      {...orgHeaderProps}
                      imagePath={team.image}
                      entitySocials={team.socials}
                      games={[team.game]}
                      showApply={showApply}
                      onApply={handleActionClick}/>
        <div className="col-span-2 space-y-4">
          <DetailContentBlock {...team} />
          <div className="">
            <TeaserList title="Members" teasers={memberTeasers}/>
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
