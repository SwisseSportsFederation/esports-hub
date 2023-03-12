import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { checkUserAuth, checkUserValid } from "~/utils/auth.server";
import { getUserMemberships } from "~/services/admin/index.server";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const userValid = await checkUserValid(user.db.id, request.url);
  const memberships = await getUserMemberships(user);
  return json({
    user,
    memberships,
    userValid
  });
}

export default function Admin() {
  const { user, memberships, userValid } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if(!userValid && !location.pathname.endsWith('/admin/user/account')) {
      navigate('/admin/user/account');
    }
  }, [location]);


  return <>
    <Navbar/>
    <div className="mt-5 flex flex-col xl:ml-0 lg:ml-72 ml-0">
      <Outlet context={{ user, memberships }}/>
    </div>
  </>;
}
