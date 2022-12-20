import VerificationLevelEnum from "./enums/VerificationLevelEnum";
import ICanton from "./ICanton";
import IEntitySocial from "./IEntitySocial";
import ILanguage from "./ILanguage";
import IOrganisationMember from "./IOrganisationMember";
import IOrganisationTeamRequest from "./IOrganisationTeamRequest";
import IOrganisationType from "./IOrganisationType";

interface IOrganisation {
  id: string;
  types: IOrganisationType[];
  name: string;
  shortName: string;
  description: string;
  website: string;
  image: string;
  street: string;
  zip: string; // numeric string
  country: string;
  languages: ILanguage[];
  canton: ICanton;
  socials: IEntitySocial[];
  teams: IOrganisationTeamRequest[];
  members: IOrganisationMember[];
  verificationLevelId: VerificationLevelEnum;
}

export default IOrganisation;
