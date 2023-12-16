import type { Game, GroupMember } from "@prisma/client";
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
