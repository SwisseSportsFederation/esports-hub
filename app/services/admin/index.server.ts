import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";
import type { StringOrNull } from "~/db/queries.server";
import { AccessRight, RequestStatus } from "@prisma/client";

export type Membership = {
  request_status: RequestStatus,
  access_rights: AccessRight
  id: bigint,
  handle: string,
  name: string,
  image: StringOrNull,
}

export type Invitation = Membership & {
  type: 'TEAM' | 'ORG'
};

function splitInvitations(array: Membership[]): [Membership[], Membership[]] {
  return array.reduce<[Membership[], Membership[]]>(([member, invitation], elem) => {
    if(elem.request_status === RequestStatus.PENDING) {
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
  const teamQuery = db.teamMember.findMany({
    where: {
      user_id: Number(user.db.id),
    },
    select: {
      request_status: true,
      access_rights: true,
      team: {
        select: {
          id: true,
          handle: true,
          name: true,
          image: true
        }
      }
    }
  });
  const orgQuery = db.organisationMember.findMany({
    where: {
      user_id: Number(user.db.id),
    },
    select: {
      request_status: true,
      access_rights: true,
      organisation: {
        select: {
          id: true,
          handle: true,
          name: true,
          image: true
        }
      }
    }
  });
  const [teams, orgs] = await Promise.all([teamQuery, orgQuery]);
  const membershipTeam: Membership[] = teams.map(team => ({
    ...team,
    ...team.team
  }));
  const membershipOrg: Membership[] = orgs.map(org => ({
    ...org,
    ...org.organisation
  }))
  return getMemberships(membershipTeam, membershipOrg);
}

