import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";
import type { StringOrNull } from "~/db/queries.server";
import type { AccessRight } from "@prisma/client";
import { Game, RequestStatus } from "@prisma/client";

export type Membership = {
  request_status: RequestStatus,
  access_rights: AccessRight
  id: bigint,
  handle: string,
  name: string,
  image: StringOrNull,
  joined_at: Date,
  game: Game | null,
  is_main_team: boolean | null
}

function splitInvitations(array: Membership[]) {
  return array.reduce<[Membership[], Membership[]]>(([member, invitation], elem) => {
    if(elem.request_status !== RequestStatus.ACCEPTED) {
      return [member, [...invitation, elem]];
    }
    return [[...member, elem], invitation];
  }, [[], []]);
}

export async function getUserMemberships(user: AuthUser) {
  const teamQuery = db.teamMember.findMany({
    where: {
      user_id: Number(user.db.id),
    },
    orderBy: {
      joined_at: 'desc'
    },
    select: {
      request_status: true,
      access_rights: true,
      joined_at: true,
      is_main_team: true,
      team: {
        select: {
          id: true,
          handle: true,
          name: true,
          image: true,
          game: true
        }
      }
    }
  });
  const orgQuery = db.organisationMember.findMany({
    where: {
      user_id: Number(user.db.id),
    },
    orderBy: {
      joined_at: 'desc'
    },
    select: {
      request_status: true,
      access_rights: true,
      joined_at: true,
      is_main_organisation: true,
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
  const myTeamsAndInvitations = teams.map(team => {
    const { request_status, joined_at, access_rights, is_main_team } = team;

    return {
      request_status,
      joined_at,
      access_rights,
      is_main_team,
      ...team.team
    }
  });

  const myOrgsAndInvitations = orgs.map(org => {
    const { request_status, joined_at, access_rights } = org;
    return {
      request_status,
      joined_at,
      access_rights,
      game: null,
      is_main_team: org.is_main_organisation,
      ...org.organisation
    }
  });
  const [myTeams, teamInvitations] = splitInvitations(myTeamsAndInvitations);
  const [myOrgs, orgInvitations] = splitInvitations(myOrgsAndInvitations);
  return { teams: myTeams, teamInvitations, orgs: myOrgs, orgInvitations };
}

