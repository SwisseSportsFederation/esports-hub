import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useOutletContext } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin";

export default function() {
  const { user } = useOutletContext<SerializeFrom<typeof adminLoader>>();
  const navigations = ["Account", "Games", "Socials"];

  return <EditOverviewBlock title="Profile" type='USER' navigations={navigations} canDelete={true}
                            entityId={user.db.id}/>;
};
