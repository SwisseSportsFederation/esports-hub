import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { useEffect } from "react";
import Navbar from "~/components/Navbar";
import { getUserMemberships } from "~/services/admin/index.server";
import { checkSuperAdmin, checkUserAuth, checkUserValid } from "~/utils/auth.server";

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
    if (!userValid && !location.pathname.endsWith('/admin/user/account')) {
      navigate('/admin/user/account');
    }
  }, [location]);


  return <>
    <Navbar />
    <div className="mt-5 flex flex-col xl:ml-0 lg:ml-72 ml-0">
      <Outlet context={{ user, memberships }} />
    </div>
  </>;
}
