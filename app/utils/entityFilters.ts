import type { Game, GroupMember } from "@prisma/client";
import { AccessRightValue } from "~/models/database.model";
/** filters that work */
export const isTeamMember = (teamMemberships: GroupMember[], userId: number) =>
  teamMemberships.some(tm => Number(tm.user_id) === userId);

export const isOrganisationMember = (organisationMemberships: GroupMember[], userId: number) =>
  organisationMemberships.some((om: GroupMember) => Number(om.user_id) === userId);


export const getOrganisationGames = (group: { children: { child: { game: Game | null } }[] }): Game[] => {
  const games = group.children
    .map(child => child.child.game)
    .filter((game, index, array) => array.indexOf(game) === index);
  return games;
};

export const getVerificationLevelPriority = (groupMember: GroupMember) => {
  switch (groupMember.access_rights) {
    case AccessRightValue.ADMINISTRATOR:
      return 1;
    case AccessRightValue.MODERATOR:
      return 2;
    case AccessRightValue.MEMBER:
      return 3;
    default:
      return 4;
  }
}
