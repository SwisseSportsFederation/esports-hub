import { Prisma } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { z } from "zod";
import { zx } from "zodix";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import TeamHistory from "~/components/Blocks/TeamHistory";
import TeaserList from "~/components/Teaser/TeaserList";
import { EntityTypeValue, RequestStatusValue } from '~/models/database.model';
import { db } from "~/services/db.server";
import { getOrganisationTeasers } from "~/utils/teaserHelper";

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  const user = await db.user.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      former_teams: true,
      socials: true,
      games: {
        where: {
          is_active: true,
        },
      },
      canton: true,
      languages: true,
      groups: {
        where: {
          request_status: {
            equals: RequestStatusValue.ACCEPTED
          }
        },
        include: { group: { include: { children: { include: { child: { include: { game: true } } } } } } }
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

  const { former_teams: formerTeams } = user;

  const groups = user.groups.map((mem) => mem.group);
  const teamMemberships = user.groups.filter(group => group.group.group_type === EntityTypeValue.TEAM);
  const organisationTeasers = getOrganisationTeasers(groups.filter(group => group.group_type === EntityTypeValue.ORGANISATION));
  return json({
    user,
    teamMemberships,
    formerTeams,
    organisationTeasers
  });
}

export default function () {
  const { user, teamMemberships, formerTeams, organisationTeasers } = useLoaderData<typeof loader>();

  return <div className="mx-3 py-7">
    <div className="max-w-prose lg:max-w-6xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-12">
        <DetailHeader name={`${user.name} ${user.surname}`}
          handle={user.handle}
          imagePath={user.image}
          entitySocials={user.socials}
          isActive={user.is_active}
          games={user.games} />
        <div className="col-span-2 space-y-4 lg:space-y-6">
          <DetailContentBlock {...user} />
          <div className="">
            <TeamHistory memberships={teamMemberships} formerTeams={formerTeams} />
            <TeaserList title="Organisations" teasers={organisationTeasers} className="mt-4" />
          </div>
        </div>
      </div>
    </div>
  </div>;
}
