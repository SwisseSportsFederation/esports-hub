import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { checkUserAuth } from "~/utils/auth.server";
import { getUserMemberships } from "~/services/admin/index.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const memberships = await getUserMemberships(user);
  return json({
    user,
    memberships
  });
};

export default function Admin() {
  const { user, memberships } = useLoaderData<typeof loader>();

  return <div className="flex">
    <Navbar/>
    <div className="grow flex flex-col">
      <Outlet context={{user, memberships}}/>
    </div>
  </div>;
}
