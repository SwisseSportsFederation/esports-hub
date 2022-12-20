import VerificationLevelEnum from "./enums/VerificationLevelEnum";
import ICanton from "./ICanton";
import IEntitySocial from "./IEntitySocial";
import IGame from "./IGame";
import ILanguage from "./ILanguage";
import IOrganisationTeamRequest from "./IOrganisationTeamRequest";
import ITeamMember from "./ITeamMember";

interface ITeam {
  id: string;
  name: string;
  shortName: string;
  description: string;
  website: string;
  image: string;
  languages: ILanguage[];
  canton: ICanton;
  game: IGame;
  socials: IEntitySocial[];
  members: ITeamMember[];
  organisations: IOrganisationTeamRequest[];
  verificationLevelId: VerificationLevelEnum;
}

export default ITeam;
