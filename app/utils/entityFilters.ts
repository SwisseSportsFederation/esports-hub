import { Game, Organisation, Team, OrganisationMember, Team, TeamMember, RequestStatus, AccessRight } from "@prisma/client";

// TODO fix all filters, that probably don't work anymore

export const getActiveMemberships = <T extends TeamMember | OrganisationMember>(teamMemberships: T[] ): T[] => {
  return teamMemberships?.filter((tm: T) => tm.request_status_id == RequestStatus.ACCEPTED) ?? [];
};

/** Team */
export const isTeamMember = (teamMemberships: TeamMember[], userId: string): boolean => teamMemberships.some((tm: TeamMember) => tm.user.id === userId);
export const getMainTeam = (teamMemberships: TeamMember[]): Team => {
  return teamMemberships.filter((tm: TeamMember) => tm.is_main_team)[0]?.team;
};

export const getOwnTeams = (teamMemberships: TeamMember[]) : Team[] => {
  return teamMemberships?.filter((t: TeamMember) => t.access_rights_id === AccessRight.MODERATOR || t.access_rights_id == AccessRight.ADMIN).map((t: TeamMember) => t.team) ?? [];
};
// TODO: Pending is currently only on all sides not a specific one. Fix this.
export const getTeamInvitations = (teamMemberships: TeamMember[]) : Team[] => {
  return teamMemberships?.filter((t: TeamMember) => t.request_status_id == RequestStatusEnum.PendingUserAccount).map((t: TeamMember) => t.team) ?? [];
};
export const getTeamMemberInvitations = (teamMemberships: TeamMember[]) : TeamMember[] => {
  return teamMemberships?.filter((t: TeamMember) => t.request_status_id == RequestStatusEnum.PendingUserAccount) ?? [];
};
export const getTeamRequests = (teamMemberships: TeamMember[]) : TeamMember[] => {
  return teamMemberships?.filter((t: TeamMember) => t.request_status_id == RequestStatusEnum.PendingTeamAccount) ?? [];
};

/** Organisation */
export const isOrganisationMember = (organisationMemberships: OrganisationMember[], userId: string): boolean => organisationMemberships?.some((om: OrganisationMember) => om.user_id === Number(userId));
export const getOwnOrganisations = (organisationMemberships: OrganisationMember[]) : Organisation[] => {
  return organisationMemberships?.filter((o: OrganisationMember) => o.access_rights_id === AccessRight.MODERATOR || o.access_rights_id == AccessRight.ADMIN).map((o: OrganisationMember) => o.organisation) ?? [];
};
export const getOrganisationInvitations = (organisationMemberships: OrganisationMember[]) : Organisation[] => {
  return organisationMemberships?.filter((o: OrganisationMember) => o.request_status_id == RequestStatusEnum.PendingUserAccount).map((o: OrganisationMember) => o.organisation) ?? [];
};
export const getOrganisationMemberInvitations = (organisationMemberships: OrganisationMember[]) : OrganisationMember[] => {
  return organisationMemberships?.filter((om: OrganisationMember) => om.request_status_id == RequestStatusEnum.PendingUserAccount) ?? [];
};
export const getOrganisationRequests = (organisationMemberships: OrganisationMember[]) : OrganisationMember[] => {
  return organisationMemberships?.filter((om: OrganisationMember) => om.request_status_id == RequestStatusEnum.PendingOrganisationAccount) ?? [];
};

export const getOrganisationGames = (organisation: Organisation): Game[] => {
  return (organisation.teams || []).map((team: Team) => team.game).filter((game: Game, index: number, array: Game[]) => array.indexOf(game) === index);
};

/** OrganisationTeam */
export const getActiveOrganisationTeams = (orgTeamRequest: Team[]): Team[] => {
  return orgTeamRequest?.filter((r: Team) => r.request_status_id == RequestStatusEnum.Accepted).map((r: Team) => r.team) || [];
};

export const getOrganisationTeamInvitations = (orgTeamRequest: Team[]): Team[] => {
  return orgTeamRequest?.filter((r: Team) => r.request_status_id == RequestStatusEnum.PendingTeamAccount).map((r: Team) => r.team) || [];
};


export const getActiveTeamOrganisations = (orgTeamRequest: Team[]): Organisation[] => {
  return orgTeamRequest?.filter((r: Team) => r.request_status_id == RequestStatusEnum.Accepted).map((r: Team) => r.organisation) ?? [];
};

export const getTeamOrganisationInvitations = (orgTeamRequest: Team[]): Organisation[] => {
  return orgTeamRequest?.filter((r: Team) => r.request_status_id == RequestStatusEnum.PendingTeamAccount).map((r: Team) => r.organisation) ?? [];
};
