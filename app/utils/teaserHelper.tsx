import { Organisation, Team, TeamMember, OrganisationMember } from "@prisma/client";
import { ITeaserCoreProps } from "~/components/Teaser/TeaserCore";
import { EntityType } from "~/helpers/entityType";
import IconButton from "../components/Button/IconButton";
import { getOrganisationGames } from "./entityFilters";

export const getTeamTeasers = (teams: Team[]): ITeaserCoreProps[] => {
  return teams.map((team: Team) => {
    return {
      id: team.id,
      type: "TEAM" as EntityType,
      name: team.name || "",
      games: team.game ? [team.game] : [],
      avatarPath: team.image,
      team: team.name
    };
  });
};

export const getOrganisationTeasers = (organisations: Organisation[]): ITeaserCoreProps[] => {
  return organisations?.map((organisation: Organisation) => {
    return {
      id: organisation.id,
      type: "ORG" as EntityType,
      avatarPath: organisation.image || null,
      name: organisation.name || "",
      games: getOrganisationGames(organisation),
      team: null
    };
  });
};

export const getTeamMemberTeasers = (teamName: string, members: TeamMember[]): ITeaserCoreProps[] => {
  return members?.map((member: TeamMember) => {
    return {
      id: member.user.id,
      type: "USER" as EntityType,
      name: member.user.nickname,
      team: teamName,
      games: member.user.games || [],
      avatarPath: member.user.image,
    };
  });
};

export const getOrganisationMemberTeasers = (members: OrganisationMember[]): ITeaserCoreProps[] => {
  return members?.map((member: OrganisationMember) => {
    return {
      id: member.user.id,
      type: "USER" as EntityType,
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
      icons: <IconButton icon='edit' type='link' path={`${path}/${teaserProps.id}`} className="text-white"/>
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
        <IconButton icon='decline' type='button' action={() => handleRemove(teaserProps.id)} />
      </>
    };
  });
};

export const wrapWithInvitationIcons = (teasers: ITeaserCoreProps[], handleAcceptClick: (id: number) => void, handleDeclineClick: (id: number) => void): ITeaserCoreProps[] => {
  return teasers.map((teaserProps: ITeaserCoreProps) => {
    return {
      ...teaserProps,
      icons: <>
        <IconButton icon='accept' type='button' action={() => handleAcceptClick(teaserProps.id)} />
        <IconButton icon='decline' type='button' action={() => handleDeclineClick(teaserProps.id)} />
      </>
    };
  });
};


