import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useOutletContext } from "@remix-run/react";
import type { loader as handleLoader } from "~/routes/admin/organisation/$handle";
import type { SerializeFrom } from "@remix-run/server-runtime";

export default function() {
  const { organisation, accessRight } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  const navigations = ["Details", "Socials", "Teams", "Members"];
  return <EditOverviewBlock entityId={String(organisation.id)} title={organisation.name}
                            canDelete={accessRight === 'ADMINISTRATOR'} type={organisation.group_type}
                            navigations={navigations}/>;
};
