import RequestStatusEnum from "./enums/RequestStatusEnum";
import IOrganisation from "./IOrganisation";
import ITeam from "./ITeam";

interface IOrganisationTeamRequest {
  team: ITeam;
  organisation: IOrganisation;
  requestStatusId: RequestStatusEnum;
}

export default IOrganisationTeamRequest;
