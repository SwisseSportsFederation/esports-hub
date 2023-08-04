import type { AuthUser } from "~/services/auth.server";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
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

export async function checkUserValid(userId: bigint, url: string): Promise<Boolean> {
  const user = await db.user.findFirstOrThrow({
    where: {
      id: Number(userId)
    }
  });
  if(user.email && user.name && user.handle && user.surname && user.description) {
    return true;
  } else if(!url.endsWith('/admin/user/account')) {
    throw redirect('/admin/user/account');
  }
  return false;
}

export const checkIdAccessForEntity = async (userId: string | bigint, id: number, minAccess: AccessRight): Promise<AccessRight> => {

  const query = {
    where: {
      user_id: Number(userId),
      group_id: id
    },
    select: {
      access_rights: true,
      request_status: true
    }
  };
  return checkAccessForEntity(query, minAccess);
};

export const checkSuperAdmin = async (userId: bigint, redirect_user?: boolean) => {
  redirect_user = redirect_user == undefined ? true : redirect_user;
  const user = await db.user.findFirstOrThrow({
    where: {
      id: Number(userId)
    }
  });
  if(user.is_superadmin) {
    return true;
  } else if (redirect_user) {
    throw redirect('/');
  }
  return false;
}

export const checkHandleAccessForEntity = async (userId: string | bigint, handle: string | undefined, minAccess: AccessRight): Promise<AccessRight> => {
  if(!handle) {
    throw redirect('/admin');
  }

  const query = {
    where: {
      user_id: Number(userId),
      group: {
        handle
      }
    },
    select: {
      access_rights: true,
      request_status: true
    }
  };
  return checkAccessForEntity(query, minAccess);
};

const checkAccessForEntity = async (query: any, minAccess: AccessRight) => {
  let membership;
  try {
    membership = await db.groupMember.findFirstOrThrow(query);
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
