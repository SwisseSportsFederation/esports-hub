import type { AuthUser } from "~/services/auth.server";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";

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

export const checkAccessForEntity = async (user: AuthUser, entityId: number, entity: EndingType) => {
  await db.organisationMember.findFirstOrThrow({
    where: {
      user_id: Number(user.db.id),

    }
  })
};
