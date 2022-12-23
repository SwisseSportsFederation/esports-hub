import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";
import type { StringOrNull } from "~/db/queries.server";
import { RequestStatus } from "@prisma/client";

export type Membership = {
  id: bigint,
  short_name: StringOrNull,
  name: StringOrNull,
  image: StringOrNull,
  members: {
    request_status: RequestStatus | null
  }[]
}

export type Invitation = Membership & {
  type: 'TEAM' | 'ORG'
};

function splitInvitations(array: Membership[]): [Membership[], Membership[]] {
  return array.reduce<[Membership[], Membership[]]>(([member, invitation], elem) => {
    if(!elem.members[0]) {
      return [member, invitation];
    }
    if(elem.members[0].request_status === RequestStatus.PENDING) {
      return [member, [...invitation, elem]];
    }
    return [[...member, elem], invitation];
  }, [[], []]);
}


const getMemberships = (teams: Membership[], orgs: Membership[]): { invitations: Invitation[], teams: Membership[], orgs: Membership[] } => {
  let [myTeams, teamInvitations] = splitInvitations(teams);
  let [myOrgs, orgsInvitations] = splitInvitations(orgs);
  const typedTeamInvitations: Invitation[] = teamInvitations.map(invitation => ({
    ...invitation,
    type: 'TEAM'
  }));

  const typedOrgInvitations: Invitation[] = orgsInvitations.map(invitation => ({
    ...invitation,
    type: 'ORG'
  }));
  return {
    invitations: typedTeamInvitations.concat(typedOrgInvitations),
    teams: myTeams,
    orgs: myOrgs
  };
};

export async function getUserMemberships(user: AuthUser) {
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
      id: true,
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
  return getMemberships(teams, orgs);
}

