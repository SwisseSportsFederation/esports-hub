import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
import { logout } from "~/utils/auth.server";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@vercel/remix";

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
  if(!user.profile._json!.email_verified) {
    return logout(request, '/auth/verify');
  }
  let session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, user);
  let headers = new Headers({ "Set-Cookie": await commitSession(session) });
  return redirect("/admin", { headers });
};
