import type { Game, Organisation, OrganisationMember, Team, TeamMember, User, OrganisationTeam } from "@prisma/client";
import type { EntityType } from "~/helpers/entityType";
import { getOrganisationGames } from "./entityFilters";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";

export const getTeamTeasers = (teams: (Team & { game: Game })[]): Omit<ITeaserProps, 'icons'>[] => {
  return teams.map((team) => {
    return {
      id: String(team.id),
      handle: team.handle,
      type: "TEAM" as EntityType,
      name: team.name || "",
      games: [team.game],
      avatarPath: team.image,
      team: ""
    };
  });
};

type OrgWithTeamGames = Organisation & { teams: { team: { game: Game } }[] };
export const getOrganisationTeasers = (organisations: OrgWithTeamGames[]): Omit<ITeaserProps, 'icons'>[] => {
  return organisations.map((organisation) => ({
      id: String(organisation.id),
      handle: organisation.handle,
      type: "ORG" as EntityType,
      avatarPath: organisation.image,
      name: organisation.name,
      games: getOrganisationGames(organisation),
      team: null,
      icons: undefined
    })
  );
};


type TeamMemberWithUser =
  TeamMember
  & { user: User & { games: Game[] } };
export const getTeamMemberTeasers = (teamName: string, members: TeamMemberWithUser[]): Omit<ITeaserProps, 'icons'>[] => {
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

type OrganisationMemberWithUser =
  OrganisationMember
  & { user: User & { games: Game[] } };
export const getOrganisationMemberTeasers = (members: OrganisationMemberWithUser[]): Omit<ITeaserProps, 'icons'>[] => {
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

export const getOrganisationTeamTeasers = (organisationTeams: OrganisationTeam[]): Omit<ITeaserProps, 'icons'>[] => {
  return organisationTeams.map((organisationTeam) => {
    return {
      id: String(organisationTeam.organisation_id),
      handle: organisationTeam.organisation.handle,
      type: "ORG" as EntityType,
      avatarPath: organisationTeam.organisation.image,
      name: organisationTeam.organisation.name,
      games: getOrganisationGames(organisationTeam.organisation),
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


