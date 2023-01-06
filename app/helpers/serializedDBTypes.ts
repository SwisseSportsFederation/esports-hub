import { FormerTeam, OrganisationMember, TeamMember, User } from "@prisma/client";
import { StringOrNull } from "~/db/queries.server";

export type SerializedTeamMember = Omit<TeamMember, 'joined_at'> & { joined_at: StringOrNull }
export type SerializedFormerTeam = Omit<FormerTeam, 'from' | 'to'> & { from: StringOrNull, to: StringOrNull }
export type SerializedUser = Omit<User, 'birth_date'> & { birth_date: StringOrNull }
export type SerializedOrganisationMember = Omit<OrganisationMember, 'joined_at'> & { joined_at: StringOrNull }
