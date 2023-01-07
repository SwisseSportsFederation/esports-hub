import { Game, Organisation, OrganisationMember, Team, TeamMember, User } from "@prisma/client";
import { EntityType } from "~/helpers/entityType";
import { getOrganisationGames } from "./entityFilters";
import { ITeaserProps } from "~/components/Teaser/Teaser";
import { SerializeFrom } from "@remix-run/server-runtime";

type TeamWithGame = SerializeFrom<Team> & { game: SerializeFrom<Game> };
export const getTeamTeasers = (teams: TeamWithGame[]): ITeaserProps[] => {
  return teams.map((team) => {
    return {
      id: team.handle,
      type: "TEAM" as EntityType,
      name: team.name || "",
      games: [team.game],
      avatarPath: team.image,
      team: team.name
    };
  });
};

type OrgWithTeamGames = SerializeFrom<Organisation> & { teams: { game: SerializeFrom<Game> }[] };
export const getOrganisationTeasers = (organisations: OrgWithTeamGames[]): ITeaserProps[] => {
  return organisations.map((organisation) => ({
      id: organisation.handle,
      type: "ORG" as EntityType,
      avatarPath: organisation.image,
      name: organisation.name,
      games: getOrganisationGames(organisation),
      team: null,
      icons: undefined
    })
  );
};


type SerializedTeamMemberWithUser =
  SerializeFrom<TeamMember>
  & { user: SerializeFrom<User> & { games: SerializeFrom<Game>[] } };
export const getTeamMemberTeasers = (teamName: string, members: SerializedTeamMemberWithUser[]): ITeaserProps[] => {
  return members.map((member) => {
    return {
      id: member.user.handle,
      type: "USER" as EntityType,
      name: member.user.handle,
      team: teamName,
      games: member.user.games || [],
      avatarPath: member.user.image
    };
  });
};

type SerializedOrganisationMemberWithUser =
  SerializeFrom<OrganisationMember>
  & { user: SerializeFrom<User> & { games: SerializeFrom<Game>[] } };
export const getOrganisationMemberTeasers = (members: SerializedOrganisationMemberWithUser[]): ITeaserProps[] => {
  return members.map((member) => {
    return {
      id: member.user.handle,
      type: "USER" as EntityType,
      name: member.user.handle,
      team: member.role,
      games: member.user.games || [],
      avatarPath: member.user.image,
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


