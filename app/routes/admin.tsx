import { json, LoaderFunction, Outlet } from "remix";
import { authenticator } from "~/services/auth.server";
import logout from "~/utils/logout";

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
  if(!user) {
    // logged out -> log in
    user = await authenticator.authenticate("auth0", request);
    return json({ user });
  }
  // logged in
  if(!user.profile._json.email_verified) {
    // email not verified
    return logout(request, '/auth/verify');
  }
  // email verified
  return json({ user });

}

export default function() {
  return <Outlet/>;
}