import {useLoaderData} from "@remix-run/react";
import {checkUserAuth} from "~/utils/auth.server";
import {db} from "~/services/db.server";
import {LoaderFunction, json} from "@remix-run/node";
import { getTeamTeasers, getOrganisationTeasers } from "~/utils/teaserHelper";
import TeaserList from "~/components/Teaser/TeaserList";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import { RequestStatus, TeamMember, OrganisationMember } from "@prisma/client";
import TeamHistory from "~/components/Blocks/TeamHistory";
// const { addNotification } = useNotification(); // TODO add notification logic

export const loader: LoaderFunction = async ({ request, params }) => {
  const authUser = await checkUserAuth(request);
  const id = Number(params.id);

  /* TODO check query */
  const user = await db.user.findUniqueOrThrow({
    where: {
      id: id
    },
    select: {
      nickname: true,
      name: true,
      surname: true,
      image: true,
      description: true,
      canton: true,
      languages: true,
      games: true,
      organisations: {
        where: {
          request_status: {
            equals: RequestStatus.ACCEPTED
          }
        },
        include: { organisation: true },
      },
      teams: {
        where: {
          request_status: {
            equals: RequestStatus.ACCEPTED
          }
        },
        include: { team: {
          select: {
            id: true,
            name: true,
            game: true
          }
        } },
      },
      former_teams: true,
      socials: true,
    }
  }).catch(() => { 
      throw new Response("Not Found", {
        status: 404,
      }) })

  const organisations = user?.organisations.map((organisationMember: OrganisationMember) => { return organisationMember.organisation })
  const teams = user?.teams;
  const formerTeams = user?.former_teams;
  const organisationTeasers = getOrganisationTeasers(organisations);

  const result = {
    authUser,
    user,
    teams,
    formerTeams,
    organisationTeasers
  }

  return json(result);
};

export default function() {
  const data = useLoaderData();

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
        <DetailHeader name={data.user.name}
                      imagePath={data.user.image}
                      entitySocials={data.user.socials}
                      games={data.user.games} />
        <div className="col-span-2 space-y-4">
          <DetailContentBlock {...data.user} />
          <div className="-mx-4">
            <TeamHistory memberships={data.teams} formerTeams={data.formerTeams}/>
            <TeaserList title="Organisations" teasers={data.organisationTeasers} />
          </div>
        </div>
      </div>
    </div>
  </div>;
};