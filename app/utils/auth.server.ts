import { authenticator, AuthUser } from "~/services/auth.server";

function logout(request: Request, path: string = ''): Promise<void> {
  const returnTo = `http://${request.headers.get("host")}${path}`;
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const logout = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`;
  return authenticator.logout(request, { redirectTo: logout });
}

const checkUserAuth = async (request: Request): Promise<AuthUser> => {
  let user = await authenticator.isAuthenticated(request);
  if(!user) {
    // logged out -> log in
    user = await authenticator.authenticate("auth0", request);
    return user;
  }
  // logged in
  if(!user.profile._json.email_verified) {
    // email not verified
    await logout(request, '/auth/verify');
  }
  // email verified
  return user;

};

export {
  checkUserAuth
};
export default logout;