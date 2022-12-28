import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);
  return json({
    user
  });
};

export default function() {
  const { user } = useLoaderData();
  const navigations = ["Account", "Games", "Socials"];

  return <EditOverviewBlock title="Profile" type='USER' navigations={navigations} canDelete={true}
                            entityId={user.db.id}/>;
};
