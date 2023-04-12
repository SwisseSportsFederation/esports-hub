import { AccessRight, Prisma, RequestStatus } from "@prisma/client";
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
import { db } from "~/services/db.server";
import { createFlashMessage } from "~/services/toast.server";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { getOrganisationGames, isOrganisationMember } from "~/utils/entityFilters";
import { getOrganisationMemberTeasers, getTeamTeasers } from "~/utils/teaserHelper";
import { useFetcher } from "@remix-run/react";

export const action = async ({ request, params }: ActionArgs) => {
  /* Apply for Organisation */
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const organisation = await db.organisation.findUniqueOrThrow({
      where: {
        handle
      }
    });
    await db.organisationMember.create({
      data: {
        access_rights: AccessRight.MEMBER,
        is_main_organisation: false,
        request_status: RequestStatus.PENDING_ORG,
        joined_at: new Date(),
        role: "Member",
        user: { connect: { id: BigInt(user.db.id) }},
        organisation: { connect: { id: organisation.id }}
      }
    })
    console.log(`user ${user.db.id} applied for organisation ${organisation.id}`)
  } catch(error) {
    console.log(error);
    const headers = await createFlashMessage(request, 'Error while applying for organisation');
    return json({}, headers);
  }
  const headers = await createFlashMessage(request, 'Applied for organisation');
  return json({}, headers);
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedIn = await isLoggedIn(request);
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  const organisation = await db.organisation.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      socials: true,
      canton: true,
      languages: true,
      teams: { include: { team: { include: { game: true } } } },
      members: {
        where: {
          request_status: RequestStatus.ACCEPTED
        },
        include: { user: { include: { games: true } } }
      }
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

  let showApply = false;
  if(loggedIn) {
    const user = await checkUserAuth(request);
    showApply = !isOrganisationMember(organisation.members, Number(user.db.id));
  }

  const teamTeasers = getTeamTeasers(organisation.teams.map(t => t.team))
  const memberTeasers = getOrganisationMemberTeasers(organisation.members)
  return json({
    organisation,
    showApply,
    teasers: {
      teamTeasers,
      memberTeasers
    }
  });
}

export default function() {
  const { organisation, showApply, teasers } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();

  const handleActionClick = () => {
    fetcher.submit({}, {
      action: '',
      method: 'post',
    });
  }

  return <div className="mx-3 py-7">
    <div className="max-w-prose lg:max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <DetailHeader name={organisation.name}
                      imagePath={organisation.image}
                      entitySocials={organisation.socials}
                      games={getOrganisationGames(organisation)}
                      isActive={organisation.is_active}
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
