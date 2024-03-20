import type { LoaderFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { checkUserAuth, checkUserValid, checkSuperAdmin } from "~/utils/auth.server";
import { getUserMemberships } from "~/services/admin/index.server";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const userValid = await checkUserValid(user.db.id, request.url);
  const memberships = await getUserMemberships(user);
  const isSuperAdmin = await checkSuperAdmin(user.db.id, false);
  return json({
    user,
    memberships,
    userValid,
    isSuperAdmin
  });
}

export default function _layout() {
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