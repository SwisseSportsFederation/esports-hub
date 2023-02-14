import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { json } from "@remix-run/node";
import { getOrganisationTeasers } from "~/utils/teaserHelper";
import TeaserList from "~/components/Teaser/TeaserList";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import { RequestStatus } from "@prisma/client";
import TeamHistory from "~/components/Blocks/TeamHistory";
import { zx } from "zodix";
import { z } from "zod";
import type { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  /* TODO check query */
  const user = await db.user.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      former_teams: true,
      socials: true,
      games: true,
      organisations: {
        where: {
          request_status: RequestStatus.ACCEPTED
        },
        include: { organisation: { include: { teams: { include: { team: { include: { game: true } } } } } } }
      },
      teams: {
        where: {
          request_status: {
            equals: RequestStatus.ACCEPTED
          }
        },
        include: {
          team: true
        }
      }
    }
  }).catch(() => {
    throw new Response("Not Found", {
      status: 404,
    });
  });

  const { former_teams: formerTeams } = user;

  const organisations = user.organisations.map((mem) => mem.organisation);
  const teamMemberships = user.teams;
  const organisationTeasers = getOrganisationTeasers(organisations);
  return json({
    user,
    teamMemberships,
    formerTeams,
    organisationTeasers
  });
}

export default function() {
  const { user, teamMemberships, formerTeams, organisationTeasers } = useLoaderData<typeof loader>();

  return <div className="mx-3 py-7">
    <div className="max-w-prose lg:max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <DetailHeader name={user.name}
                      imagePath={user.image}
                      entitySocials={user.socials}
                      games={user.games}/>
        <div className="col-span-2 space-y-4">
          <DetailContentBlock {...user} />
          <div className="">
            <TeamHistory memberships={teamMemberships} formerTeams={formerTeams}/>
            <TeaserList title="Organisations" teasers={organisationTeasers}/>
          </div>
        </div>
      </div>
    </div>
  </div>;
};
