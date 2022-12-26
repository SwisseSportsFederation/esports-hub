import { games, organisations, teams, organisation_members, organisation_teams, team_members } from "@prisma/client";

// TODO fix all filters, that probably don't work anymore

export const getActiveMemberships = <T extends team_members | organisation_members>(teamMemberships: T[] ): T[] => {
  return teamMemberships?.filter((tm: T) => tm.request_status_id == RequestStatus.ACCEPTED) ?? [];
};

/** Team */
export const isTeamMember = (teamMemberships: team_members[], userId: string): boolean => teamMemberships.some((tm: team_members) => tm.user.id === userId);
export const getMainTeam = (teamMemberships: team_members[]): teams => {
  return teamMemberships.filter((tm: team_members) => tm.is_main_team)[0]?.team;
};

export const getOwnTeams = (teamMemberships: team_members[]) : teams[] => {
  return teamMemberships?.filter((t: team_members) => t.access_rights_id === AccessRightsEnum.Moderator || t.access_rights_id == AccessRightsEnum.Admin).map((t: team_members) => t.team) ?? [];
};
export const getTeamInvitations = (teamMemberships: team_members[]) : teams[] => {
  return teamMemberships?.filter((t: team_members) => t.request_status_id == RequestStatusEnum.PendingUserAccount).map((t: team_members) => t.team) ?? [];
};
export const getTeamMemberInvitations = (teamMemberships: team_members[]) : team_members[] => {
  return teamMemberships?.filter((t: team_members) => t.request_status_id == RequestStatusEnum.PendingUserAccount) ?? [];
};
export const getTeamRequests = (teamMemberships: team_members[]) : team_members[] => {
  return teamMemberships?.filter((t: team_members) => t.request_status_id == RequestStatusEnum.PendingTeamAccount) ?? [];
};

/** Organisation */
export const isOrganisationMember = (organisationMemberships: organisation_members[], userId: string): boolean => organisationMemberships?.some((om: organisation_members) => om.user.id === userId);
export const getOwnOrganisations = (organisationMemberships: organisation_members[]) : organisations[] => {
  return organisationMemberships?.filter((o: organisation_members) => o.access_rights_id === AccessRightsEnum.Moderator || o.access_rights_id == AccessRightsEnum.Admin).map((o: organisation_members) => o.organisation) ?? [];
};
export const getOrganisationInvitations = (organisationMemberships: organisation_members[]) : organisations[] => {
  return organisationMemberships?.filter((o: organisation_members) => o.request_status_id == RequestStatusEnum.PendingUserAccount).map((o: organisation_members) => o.organisation) ?? [];
};
export const getOrganisationMemberInvitations = (organisationMemberships: organisation_members[]) : organisation_members[] => {
  return organisationMemberships?.filter((om: organisation_members) => om.request_status_id == RequestStatusEnum.PendingUserAccount) ?? [];
};
export const getOrganisationRequests = (organisationMemberships: organisation_members[]) : organisation_members[] => {
  return organisationMemberships?.filter((om: organisation_members) => om.request_status_id == RequestStatusEnum.PendingOrganisationAccount) ?? [];
};

export const getAcceptedOrganisationTeams = (teamRequests: organisation_teams[]): teams[] => {
  return teamRequests?.filter((teamRequest: organisation_teams) => teamRequest.request_status_id == RequestStatusEnum.Accepted).map((teamRequest: organisation_teams) => teamRequest.team) ?? [];
};

export const getOrganisationGames = (organisation: organisations): games[] => {
  return (organisation.teams || []).map((team: organisation_teams) => team.games).filter((game: games, index: number, array: games[]) => array.indexOf(game) === index);
};

/** OrganisationTeam */
export const getActiveOrganisationTeams = (orgTeamRequest: organisation_teams[]): teams[] => {
  return orgTeamRequest?.filter((r: organisation_teams) => r.request_status_id == RequestStatusEnum.Accepted).map((r: organisation_teams) => r.team) || [];
};

export const getOrganisationTeamInvitations = (orgTeamRequest: organisation_teams[]): teams[] => {
  return orgTeamRequest?.filter((r: organisation_teams) => r.request_status_id == RequestStatusEnum.PendingTeamAccount).map((r: organisation_teams) => r.team) || [];
};


export const getActiveTeamOrganisations = (orgTeamRequest: organisation_teams[]): organisations[] => {
  return orgTeamRequest?.filter((r: organisation_teams) => r.request_status_id == RequestStatusEnum.Accepted).map((r: organisation_teams) => r.organisation) ?? [];
};

export const getTeamOrganisationInvitations = (orgTeamRequest: organisation_teams[]): organisations[] => {
  return orgTeamRequest?.filter((r: organisation_teams) => r.request_status_id == RequestStatusEnum.PendingTeamAccount).map((r: organisation_teams) => r.organisation) ?? [];
};
