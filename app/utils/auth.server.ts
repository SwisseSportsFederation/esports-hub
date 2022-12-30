import type { AuthUser } from "~/services/auth.server";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { EntityType } from "~/helpers/entityType";
import { AccessRight } from "@prisma/client";
import { json } from "@remix-run/node";

export function logout(request: Request, path: string = ''): Promise<void> {
  const url = new URL(request.url);
  const returnTo = `${url.protocol}//${url.host}${path}`;
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const logout = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`;
  return authenticator.logout(request, { redirectTo: logout });
}

export async function isLoggedIn (request: Request): Promise<Boolean> {
  let user = await authenticator.isAuthenticated(request);
  return !!user;
}

export async function checkUserAuth (request: Request): Promise<AuthUser> {
  let user = await authenticator.isAuthenticated(request);
  if(!user) {
    // logged out -> log in
    user = await authenticator.authenticate("auth0", request);
    return user;
  }
  // logged in
  if(!user.profile._json!.email_verified) {
    // email not verified
    await logout(request, '/auth/verify');
  }
  // email verified
  return user;

}

export const checkAccessForEntity = async (user: AuthUser, entityId: number, entity: Omit<EntityType, 'USER'>, minAccess: AccessRight): Promise<void> => {
  const entityName = entity === 'TEAM' ? 'team_id' : 'organisation_id';

  const query = {
    where: {
      user_id: Number(user.db.id),
      [entityName]: entityId
    },
    select: {
      access_rights: true
    }
  };

  let membership;
  if(entity === 'TEAM') {
    membership = await db.teamMember.findFirstOrThrow(query);
  } else {
    membership = await db.organisationMember.findFirstOrThrow(query);
  }

  const accessRoles = ['MEMBER', 'MODERATOR', 'ADMINISTRATOR'];
  const index = accessRoles.indexOf(minAccess);
  const allowed = accessRoles.splice(index);
  if(allowed.includes(membership.access_rights)) {
    return;
  }
  throw json({}, 403);
};
