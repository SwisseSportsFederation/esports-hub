import AccessRightsEnum from "../models/enums/AccessRightsEnum";
import RequestStatusEnum from "../models/enums/RequestStatusEnum";
import IGame from "../models/IGame";
import IOrganisation from "../models/IOrganisation";
import IOrganisationMember from "../models/IOrganisationMember";
import IOrganisationTeamRequest from "../models/IOrganisationTeamRequest";
import ITeam from "../models/ITeam";
import ITeamMember from "../models/ITeamMember";

export const getActiveMemberships = <T extends ITeamMember | IOrganisationMember>(teamMemberships: T[] ): T[] => {
  return teamMemberships?.filter((tm: T) => tm.requestStatusId == RequestStatusEnum.Accepted) ?? [];
};

/** Team */
export const isTeamMember = (teamMemberships: ITeamMember[], userId: string): boolean => teamMemberships.some((tm: ITeamMember) => tm.user.id === userId);
export const getMainTeam = (teamMemberships: ITeamMember[]): ITeam => {
  return teamMemberships.filter((tm: ITeamMember) => tm.isMainTeam)[0]?.team;
};

export const getOwnTeams = (teamMemberships: ITeamMember[]) : ITeam[] => {
  return teamMemberships?.filter((t: ITeamMember) => t.accessRightsId === AccessRightsEnum.Moderator || t.accessRightsId == AccessRightsEnum.Admin).map((t: ITeamMember) => t.team) ?? [];
};
export const getTeamInvitations = (teamMemberships: ITeamMember[]) : ITeam[] => {
  return teamMemberships?.filter((t: ITeamMember) => t.requestStatusId == RequestStatusEnum.PendingUserAccount).map((t: ITeamMember) => t.team) ?? [];
};
export const getTeamMemberInvitations = (teamMemberships: ITeamMember[]) : ITeamMember[] => {
  return teamMemberships?.filter((t: ITeamMember) => t.requestStatusId == RequestStatusEnum.PendingUserAccount) ?? [];
};
export const getTeamRequests = (teamMemberships: ITeamMember[]) : ITeamMember[] => {
  return teamMemberships?.filter((t: ITeamMember) => t.requestStatusId == RequestStatusEnum.PendingTeamAccount) ?? [];
};

/** Organisation */
export const isOrganisationMember = (organisationMemberships: IOrganisationMember[], userId: string): boolean => organisationMemberships?.some((om: IOrganisationMember) => om.user.id === userId);
export const getOwnOrganisations = (organisationMemberships: IOrganisationMember[]) : IOrganisation[] => {
  return organisationMemberships?.filter((o: IOrganisationMember) => o.accessRightsId === AccessRightsEnum.Moderator || o.accessRightsId == AccessRightsEnum.Admin).map((o: IOrganisationMember) => o.organisation) ?? [];
};
export const getOrganisationInvitations = (organisationMemberships: IOrganisationMember[]) : IOrganisation[] => {
  return organisationMemberships?.filter((o: IOrganisationMember) => o.requestStatusId == RequestStatusEnum.PendingUserAccount).map((o: IOrganisationMember) => o.organisation) ?? [];
};
export const getOrganisationMemberInvitations = (organisationMemberships: IOrganisationMember[]) : IOrganisationMember[] => {
  return organisationMemberships?.filter((om: IOrganisationMember) => om.requestStatusId == RequestStatusEnum.PendingUserAccount) ?? [];
};
export const getOrganisationRequests = (organisationMemberships: IOrganisationMember[]) : IOrganisationMember[] => {
  return organisationMemberships?.filter((om: IOrganisationMember) => om.requestStatusId == RequestStatusEnum.PendingOrganisationAccount) ?? [];
};

export const getAcceptedOrganisationTeams = (teamRequests: IOrganisationTeamRequest[]): ITeam[] => {
  return teamRequests?.filter((teamRequest: IOrganisationTeamRequest) => teamRequest.requestStatusId == RequestStatusEnum.Accepted).map((teamRequest: IOrganisationTeamRequest) => teamRequest.team) ?? [];
};

export const getOrganisationGames = (organisation: IOrganisation): IGame[] => {
  return (organisation.teams || []).map((team: IOrganisationTeamRequest) => team.team.game).filter((game: IGame, index: number, array: IGame[]) => array.indexOf(game) === index);
};

/** OrganisationTeam */
export const getActiveOrganisationTeams = (orgTeamRequest: IOrganisationTeamRequest[]): ITeam[] => {
  return orgTeamRequest?.filter((r: IOrganisationTeamRequest) => r.requestStatusId == RequestStatusEnum.Accepted).map((r: IOrganisationTeamRequest) => r.team) || [];
};

export const getOrganisationTeamInvitations = (orgTeamRequest: IOrganisationTeamRequest[]): ITeam[] => {
  return orgTeamRequest?.filter((r: IOrganisationTeamRequest) => r.requestStatusId == RequestStatusEnum.PendingTeamAccount).map((r: IOrganisationTeamRequest) => r.team) || [];
};


export const getActiveTeamOrganisations = (orgTeamRequest: IOrganisationTeamRequest[]): IOrganisation[] => {
  return orgTeamRequest?.filter((r: IOrganisationTeamRequest) => r.requestStatusId == RequestStatusEnum.Accepted).map((r: IOrganisationTeamRequest) => r.organisation) ?? [];
};

export const getTeamOrganisationInvitations = (orgTeamRequest: IOrganisationTeamRequest[]): IOrganisation[] => {
  return orgTeamRequest?.filter((r: IOrganisationTeamRequest) => r.requestStatusId == RequestStatusEnum.PendingTeamAccount).map((r: IOrganisationTeamRequest) => r.organisation) ?? [];
};
