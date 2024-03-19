import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useOutletContext } from "@remix-run/react";
import type { loader as handleLoader } from "~/routes/admin+/team/$handle";
import type { SerializeFrom } from "@remix-run/server-runtime";

export default function() {
  const { team, accessRight } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  const navigations = ["Details", "Socials", "Members", "Organisation"];
  return <EditOverviewBlock entityId={String(team.id)} title={team.name} canDelete={accessRight === 'ADMINISTRATOR'}
            type={team.group_type} navigations={navigations}/>;
};
