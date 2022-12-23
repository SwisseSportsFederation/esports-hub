import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import BlockTeaser from "~/components/Teaser/BlockTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import type { StringOrNull } from "~/db/queries.server";
import type { ReactNode } from "react";
import { RequestStatus } from "@prisma/client";


type Membership = {
  short_name: StringOrNull,
  name: StringOrNull,
  image: StringOrNull,
  members: {
    request_status: RequestStatus | null
  }[]
};

function splitInvitations<T extends Membership>(array: T[]): [T[], T[]] {
  return array.reduce(([pass, fail]: [T[], T[]], elem: T): [T[], T[]] => {
    if(!elem.members[0]) {
      return [pass, fail];
    }
    if(elem.members[0].request_status === RequestStatus.PENDING) {
      return [pass, [...fail, elem]];
    }
    return [[...pass, elem], fail];
  }, [[], []]);
}


const getMemberships = (teams: Membership[], orgs: Membership[]): { invitations: Membership[], teams: Membership[], orgs: Membership[] } => {
  const [myTeams, teamInvitations] = splitInvitations(teams);
  const [myOrgs, orgsInvitations] = splitInvitations(orgs);
  const invitations = new Array<Membership>().concat(teamInvitations, orgsInvitations);

  return {
    invitations,
    teams: myTeams,
    orgs: myOrgs
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);
  const query = {
    where: {
      members: {
        some: {
          user: {
            auth_id: user.profile.id
          }
        }
      }
    },
    select: {
      short_name: true,
      name: true,
      image: true,
      members: {
        select: {
          request_status: true
        },
        where: {
          user: {
            auth_id: user.profile.id
          }
        }
      }
    }
  };

  const teamQuery = db.team.findMany(query);
  const orgQuery = db.organisation.findMany(query);
  const [teams, orgs] = await Promise.all([teamQuery, orgQuery]);
  const result = getMemberships(teams, orgs);
  return json(result);
};

export default function() {
  const data = useLoaderData();

  const getTeaser = (memberships: Membership[], icons: ReactNode) => {
    return memberships.map((mem: Membership) => ({
      avatarPath: mem.image ?? undefined,
      name: mem.name ?? "",
      team: mem.short_name ?? undefined,
      games: [],
      icons: <>
        {icons}
      </>
    }));
  };

  const editIcon = <IconButton icon='edit' path='/admin/teams' />;
  const statusIcons = <>
    <IconButton icon='accept' action={() => console.log("a")} />
    <IconButton icon='decline' action={() => console.log("d")} />
  </>;
  const teamsTeaser = getTeaser(data.teams, editIcon);
  const orgTeaser = getTeaser(data.orgs, editIcon);
  const invitationTeaser = getTeaser(data.invitations, statusIcons);

  return <div className="max-w-prose	mx-auto">
    <H1 className="mx-2 px-2">Personal</H1>
    <div className="flex w-full relative justify-center flex-wrap">
      <BlockTeaser text="Profile" icon="user-solid.svg" path={`user`}/>
      <BlockTeaser text="Teams" icon="teams.svg" path={`teams`}/>
      <BlockTeaser text="Organisations" icon="organisations.svg" path={`organisations`}/>
    </div>
    <TeaserList title="Your Teams" teasers={teamsTeaser}/>
    <div className="flex justify-center mt-4 mb-8">
      <IconButton icon={"add"} path="/admin/teams/0/details"/>
    </div>
    <TeaserList title="Your Organisations" teasers={orgTeaser}/>
    <div className="flex justify-center mt-4 mb-8">
      <IconButton icon={"add"} path="/admin/organisations/0/details"/>
    </div>
    { invitationTeaser.length > 0 &&
      <TeaserList title="Your invitations" teasers={invitationTeaser} />
    }
  </div>;
};
