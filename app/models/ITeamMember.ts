import AccessRightsEnum from "./enums/AccessRightsEnum";
import RequestStatusEnum from "./enums/RequestStatusEnum";
import ITeam from "./ITeam";
import IUser from "./IUser";

interface ITeamMember {
  user: IUser;
  team: ITeam;
  isMainTeam: boolean;
  joinedAt: Date;
  role: string;
  requestStatusId: RequestStatusEnum;
  accessRightsId: AccessRightsEnum;
}

export default ITeamMember;
