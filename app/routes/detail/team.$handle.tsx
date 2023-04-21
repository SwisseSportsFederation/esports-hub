import { Prisma, RequestStatus } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { z } from "zod";
import { zx } from "zodix";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import ActionButton from "~/components/Button/ActionButton";
import TeaserList from "~/components/Teaser/TeaserList";
import { entityToPathSegment } from "~/helpers/entityType";
import { db } from "~/services/db.server";
import { createFlashMessage } from "~/services/toast.server";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { isTeamMember } from "~/utils/entityFilters";
import { getTeamMemberTeasers } from "~/utils/teaserHelper";
import { AccessRight } from "@prisma/client";
import { useFetcher } from "@remix-run/react";

export const action = async ({ request, params }: ActionArgs) => {
  /* Apply for Team */
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const team = await db.team.findUniqueOrThrow({
      where: {
        handle
      }
    });
    await db.teamMember.create({
      data: {
        access_rights: AccessRight.MEMBER,
        request_status: RequestStatus.PENDING_TEAM,
        joined_at: new Date(),
        is_main_team: false,
        role: "Member",
        user: { connect: { id: BigInt(user.db.id) }},
        team: { connect: { id: team.id }}
      }
    })
    console.log(`user ${user.db.id} applied for team ${team.id}`)
  } catch(error) {
    console.log(error);
    const headers = await createFlashMessage(request, 'Error while applying for team');
    return json({}, headers);
  }
  const headers = await createFlashMessage(request, 'Applied for team');
  return json({}, headers);
};

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
      socials: true,
      languages: true,
      canton: true
    }
  }).catch((e) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2015') {
        throw new Response("Not Found", {
          status: 404,
        })
      } else {
        throw new Response("Server Error", {
          status: 500,
          statusText: `Server Error: ${e.code}`
        })
      }
    } else {
      throw new Response("Server Error", {
        status: 500,
        statusText: "Server Error"
      })
    }
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

  const fetcher = useFetcher();

  const handleActionClick = () => {
    fetcher.submit({}, {
      action: '',
      method: 'post',
    });
  }

  const orgHeaderProps = (team.organisation && team.organisation.organisation) ? {
    parentLink: `/detail/${entityToPathSegment('ORG')}/${team.organisation.organisation.handle}`,
    parentName: team.organisation.organisation.name
  } : {};

  return <div className="mx-3 py-7">
    <div className="max-w-prose lg:max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <DetailHeader name={team.name}
                      {...orgHeaderProps}
                      imagePath={team.image}
                      entitySocials={team.socials}
                      games={[team.game]}
                      isActive={team.is_active}
                      showApply={showApply}
                      onApply={handleActionClick}/>
        <div className="col-span-2 space-y-4">
          <DetailContentBlock {...team} />
          <div>
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
