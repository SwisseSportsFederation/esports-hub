import type { Game, Group, User, GroupMember, GroupToGroup } from "@prisma/client";
import { getOrganisationGames } from "./entityFilters";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import { EntityTypeValue } from '~/models/database.model';

export const getTeamTeasers = (teams: (Group & { game: Game | null })[]): Omit<ITeaserProps, 'icons'>[] => {
  return teams.map((team) => {
    return {
      id: String(team.id),
      handle: team.handle,
      type: EntityTypeValue.TEAM,
      name: team.name || "",
      games: [team.game],
      avatarPath: team.image,
      team: ""
    };
  });
};

type GroupWithTeamGames = Group & { children: { child: { game: Game | null } }[] };
export const getOrganisationTeasers = (groups: GroupWithTeamGames[]): Omit<ITeaserProps, 'icons'>[] => {
  return groups.map((organisation) => ({
    id: String(organisation.id),
    handle: organisation.handle,
    type: EntityTypeValue.ORGANISATION,
    avatarPath: organisation.image,
    name: organisation.name,
    games: getOrganisationGames(organisation),
    team: null,
    icons: undefined
  })
  );
};


type GroupMemberWithUser =
  GroupMember
  & { user: User & { games: Game[] } };
export const getTeamMemberTeasers = (teamName: string, members: GroupMemberWithUser[]): Omit<ITeaserProps, 'icons'>[] => {
  return members.map((member) => {
    return {
      id: String(member.user.id),
      handle: member.user.handle,
      type: EntityTypeValue.USER,
      name: member.user.handle,
      description: member.role,
      team: teamName,
      games: member.user.games || [],
      avatarPath: member.user.image
    };
  });
};

export const getOrganisationMemberTeasers = (members: GroupMemberWithUser[]): Omit<ITeaserProps, 'icons'>[] => {
  return members.map((member) => {
    return {
      id: String(member.user.id),
      handle: member.user.handle,
      type: EntityTypeValue.USER,
      name: member.user.handle,
      description: member.role,
      games: member.user.games || [],
      avatarPath: member.user.image,
    };
  });
};

export const getOrganisationTeamTeasers = (organisationTeams: GroupToGroup[]): Omit<ITeaserProps, 'icons'>[] => {
  return organisationTeams.map((organisationTeam) => {
    return {
      id: String(organisationTeam.parent_id),
      handle: organisationTeam.parent.handle,
      type: "ORGANISATION" as EntityType,
      avatarPath: organisationTeam.parent.image,
      name: organisationTeam.parent.name,
      games: getOrganisationGames(organisationTeam.parent),
      team: null,
      icons: undefined
    };
  });
};
