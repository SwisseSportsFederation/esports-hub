import type { LoaderFunction } from "remix";
import { redirect } from "remix";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
import logout from "~/utils/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
  let user;
  try {
    user = await authenticator.authenticate("auth0", request, {
      failureRedirect: "/",
      throwOnError: true
    });
  } catch(error) {
    console.log(error);
    return redirect("/");
  }
  if(!user.profile._json.email_verified) {
    return logout(request, '/auth/verify');
  }
  let session = await getSession(request.headers.get("cookie"));
  // and store the user data
  session.set(authenticator.sessionKey, user);

  // commit the session
  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  // and do your validation to know where to redirect the user
  return redirect("/admin", { headers });
};