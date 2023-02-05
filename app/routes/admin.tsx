import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { checkUserAuth } from "~/utils/auth.server";
import { getUserMemberships } from "~/services/admin/index.server";
import type { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const memberships = await getUserMemberships(user);
  return json({
    user,
    memberships
  });
}

export default function Admin() {
  const { user, memberships } = useLoaderData<typeof loader>();

  return <>
    <Navbar/>
    <div className="mt-5 flex flex-col xl:ml-0 lg:ml-72 ml-0">
      <Outlet context={{ user, memberships }}/>
    </div>
  </>;
}
