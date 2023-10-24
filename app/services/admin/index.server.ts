import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";
import type { StringOrNull } from "~/db/queries.server";
import type { AccessRight } from "@prisma/client";
import { Game, RequestStatus, GroupType } from "@prisma/client";

export type Membership = {
  request_status: RequestStatus,
  access_rights: AccessRight
  id: bigint,
  handle: string,
  name: string,
  image: StringOrNull,
  joined_at: Date,
  game: Game | null,
  is_main_group: boolean | null,
  groupType: GroupType
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
  const query = db.groupMember.findMany({
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
      is_main_group: true,
      group: {
        select: {
          id: true,
          handle: true,
          name: true,
          image: true,
          game: true,
          groupType: true,
        }
      }
    }
  });
  const [groups] = await Promise.all([query]);
  const myGroupsAndInvitations = groups.map(group => {
    const { request_status, joined_at, access_rights, is_main_group } = group;

    return {
      request_status,
      joined_at,
      access_rights,
      is_main_group,
      ...group.group
    }
  });

  const [myGroups, groupInvitations] = splitInvitations(myGroupsAndInvitations);
  return { groups: myGroups, groupInvitations};
}

