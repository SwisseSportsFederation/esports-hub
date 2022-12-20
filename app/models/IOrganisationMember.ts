import AccessRightsEnum from "./enums/AccessRightsEnum";
import RequestStatusEnum from "./enums/RequestStatusEnum";
import IOrganisation from "./IOrganisation";
import IUser from "./IUser";

interface IOrganisationMember {
  user: IUser;
  organisation: IOrganisation;
  isMainOrganisation: boolean;
  joinedAt: Date;
  role: string;
  requestStatusId: RequestStatusEnum;
  accessRightsId: AccessRightsEnum;
}

export default IOrganisationMember;
