import VerificationLevelEnum from "./enums/VerificationLevelEnum";
import ICanton from "./ICanton";
import IEntitySocial from "./IEntitySocial";
import IFormerTeam from "./IFormerTeam";
import IGame from "./IGame";
import ILanguage from "./ILanguage";
import IOrganisationMember from "./IOrganisationMember";
import ITeamMember from "./ITeamMember";

interface IUser {
  id: string;
  email: string;
  nickname: string;
  name: string;
  surname: string;
  birthDate: string;
  description: string;
  image: string;
  languages: ILanguage[];
  canton: ICanton;
  games: IGame[];
  socials: IEntitySocial[];
  formerTeams: IFormerTeam[];
  teamMemberships: ITeamMember[];
  organisationMemberships: IOrganisationMember[];
  verificationLevelId: VerificationLevelEnum;
}

export default IUser;
