import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useOutletContext } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin+/_layout";

export default function() {
  const { user } = useOutletContext<SerializeFrom<typeof adminLoader>>();
  const navigations = ["Account", "Games", "Socials"];

  return <EditOverviewBlock title="Profile" type='USER' navigations={navigations} canDelete={false}
                            entityId={user.db.id}/>;
};
