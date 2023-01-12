import type { AuthUser } from "~/services/auth.server";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
import type { EntityType } from "~/helpers/entityType";
import type { AccessRight } from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { redirect } from "@remix-run/node";

export function logout(request: Request, path: string = ''): Promise<void> {
  const url = new URL(request.url);
  const returnTo = `${url.protocol}//${url.host}${path}`;
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const logout = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`;
  return authenticator.logout(request, { redirectTo: logout });
}

export async function isLoggedIn(request: Request): Promise<Boolean> {
  let user = await authenticator.isAuthenticated(request);
  return !!user;
}

export async function checkUserAuth(request: Request): Promise<AuthUser> {
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

export const checkIdAccessForEntity = async (user: AuthUser, id: number, entity: Omit<EntityType, 'USER'>, minAccess: AccessRight): Promise<AccessRight> => {
  const entityName = entity === 'TEAM' ? 'team_id' : 'organisation_id';

  const query = {
    where: {
      user_id: Number(user.db.id),
      [entityName]: id
    },
    select: {
      access_rights: true,
      request_status: true
    }
  };
  return checkAccessForEntity(entity, query, minAccess);
};

export const checkHandleAccessForEntity = async (user: AuthUser, handle: string | undefined, entity: Omit<EntityType, 'USER'>, minAccess: AccessRight): Promise<AccessRight> => {
  if(!handle) {
    throw redirect('/admin');
  }
  const entityName = entity === 'TEAM' ? 'team' : 'organisation';

  const query = {
    where: {
      user_id: Number(user.db.id),
      [entityName]: {
        handle
      }
    },
    select: {
      access_rights: true,
      request_status: true
    }
  };
  return checkAccessForEntity(entity, query, minAccess);
};

const checkAccessForEntity = async (entity: Omit<EntityType, 'USER'>, query: any, minAccess: AccessRight) => {
  let membership;
  try {
    if(entity === 'TEAM') {
      membership = await db.teamMember.findFirstOrThrow(query);
    } else {
      membership = await db.organisationMember.findFirstOrThrow(query);
    }
  } catch(error) {
    console.log(error);
    throw redirect('/admin')
  }

  if(membership.request_status !== RequestStatus.ACCEPTED) {
    throw redirect('/admin')
  }

  const accessRoles = ['MEMBER', 'MODERATOR', 'ADMINISTRATOR'];
  const index = accessRoles.indexOf(minAccess);
  const allowed = accessRoles.splice(index);
  if(allowed.includes(membership.access_rights)) {
    return membership.access_rights;
  }
  throw redirect('/admin');

}
