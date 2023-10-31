import type { Game, Group, User, GroupMember, GroupToGroup } from "@prisma/client";
import { EntityType } from "@prisma/client";
import { getOrganisationGames } from "./entityFilters";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";

export const getTeamTeasers = (teams: (Group & { game: Game | null })[]): Omit<ITeaserProps, 'icons'>[] => {
  return teams.map((team) => {
    return {
      id: String(team.id),
      handle: team.handle,
      type: "TEAM" as EntityType,
      name: team.name || "",
      games: [team.game || ""],
      avatarPath: team.image,
      team: ""
    };
  });
};

type GroupWithTeamGames = Group & { children: { child: { game: Game } }[] };
export const getOrganisationTeasers = (groups: GroupWithTeamGames[]): Omit<ITeaserProps, 'icons'>[] => {
  return groups.map((organisation) => ({
      id: String(organisation.id),
      handle: organisation.handle,
      type: "ORGANISATION" as EntityType,
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
      type: "USER" as EntityType,
      name: member.user.handle,
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
      type: "USER" as EntityType,
      name: member.user.handle,
      team: member.role,
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

// export const wrapWithEditIcon = (teasers: ITeaserCoreProps[], path: string): ITeaserCoreProps[] => {
//   return teasers.map((teaserProps: ITeaserCoreProps) => {
//     return {
//       ...teaserProps,
//       icons: <IconButton icon='edit' type='link' path={`${path}/${teaserProps.}`} className="text-white"/>
//     };
//   });
// };
//
// export const wrapWithClockIcon = (teasers: ITeaserCoreProps[]): ITeaserCoreProps[] => {
//   return teasers.map((teaserProps: ITeaserCoreProps) => {
//     return {
//       ...teaserProps,
//       icons: <IconButton icon='clock' type='button' action={() => void 0}/>
//     };
//   });
// };
//
// export const wrapWithIRemoveIcon = (teasers: ITeaserCoreProps[], handleRemove: (id: number) => void): ITeaserCoreProps[] => {
//   return teasers.map((teaserProps: ITeaserCoreProps) => {
//     return {
//       ...teaserProps,
//       icons: <>
//         <IconButton icon='decline' type='button' action={() => handleRemove(teaserProps.id)} />
//       </>
//     };
//   });
// };
//
// export const wrapWithInvitationIcons = (teasers: ITeaserCoreProps[], handleAcceptClick: (id: number) => void, handleDeclineClick: (id: number) => void): ITeaserCoreProps[] => {
//   return teasers.map((teaserProps: ITeaserCoreProps) => {
//     return {
//       ...teaserProps,
//       icons: <>
//         <IconButton icon='accept' type='button' action={() => handleAcceptClick(teaserProps.id)} />
//         <IconButton icon='decline' type='button' action={() => handleDeclineClick(teaserProps.id)} />
//       </>
//     };
//   });
// };


