import { ITeaserCoreProps } from "~/components/Teaser/TeaserCore";
import IconButton from "../components/Button/IconButton";
import { getOrganisationGames } from "./entityFilters";

export const getTeamTeasers = (teams: ITeam[]): ITeaserCoreProps[] => {
  return teams.map((team: ITeam) => {
    return {
      id: team.id,
      type: EntityType.Team,
      name: team.name,
      games: team.game ? [team.game] : [],
      avatarPath: team.image
    };
  });
};

export const getOrganisationTeasers = (organisations: IOrganisation[]): ITeaserCoreProps[] => {
  return organisations?.map((organisation: IOrganisation) => {
    return {
      id: organisation.id,
      type: EntityType.Organisation,
      name: organisation.name,
      games: getOrganisationGames(organisation),
      avatarPath: organisation.image,
    };
  });
};

export const getTeamMemberTeasers = (teamName: string, members: team_members[]): ITeaserCoreProps[] => {
  return members?.map((member: team_members) => {
    return {
      id: member.user.id,
      type: EntityType.User,
      name: member.user.nickname,
      team: teamName,
      games: member.user.games || [],
      avatarPath: member.user.image,
    };
  });
};

export const getOrganisationMemberTeasers = (organisationMembers: organisation_members[]): ITeaserCoreProps[] => {
  return organisationMembers?.map((member: organisation_members) => {
    return {
      id: member.user.id,
      type:  EntityType.User,
      name: member.user.nickname,
      team: member.role,
      games: member.user.games || [],
      avatarPath: member.user.image,
    };
  });
};

export const wrapWithEditIcon = (teasers: ITeaserCoreProps[], path: string): ITeaserCoreProps[] => {
  return teasers.map((teaserProps: ITeaserCoreProps) => {
    return {
      ...teaserProps,
      icons: <IconButton icon='edit' path={`${path}/${teaserProps.id}`} className="text-white"/>
    };
  });
};

export const wrapWithClockIcon = (teasers: ITeaserCoreProps[]): ITeaserCoreProps[] => {
  return teasers.map((teaserProps: ITeaserCoreProps) => {
    return {
      ...teaserProps,
      icons: <IconButton icon='clock'/>
    };
  });
};

export const wrapWithIRemoveIcon = (teasers: ITeaserCoreProps[], handleRemove: (id: number) => void): ITeaserCoreProps[] => {
  return teasers.map((teaserProps: ITeaserCoreProps) => {
    return {
      ...teaserProps,
      icons: <>
        <IconButton icon='decline' action={() => handleRemove(teaserProps.id)} />
      </>
    };
  });
};

export const wrapWithInvitationIcons = (teasers: ITeaserCoreProps[], handleAcceptClick: (id: number) => void, handleDeclineClick: (id: number) => void): ITeaserCoreProps[] => {
  return teasers.map((teaserProps: ITeaserCoreProps) => {
    return {
      ...teaserProps,
      icons: <>
        <IconButton icon='accept' action={() => handleAcceptClick(teaserProps.id)} />
        <IconButton icon='decline' action={() => handleDeclineClick(teaserProps.id)} />
      </>
    };
  });
};


