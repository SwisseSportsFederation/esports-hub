import { authenticator } from "~/services/auth.server";

export default function(request: Request, path: string = ''): Promise<void> {
  const returnTo = `http://${request.headers.get("host")}${path}`;
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const logout = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`
  return authenticator.logout(request, { redirectTo: logout });
}