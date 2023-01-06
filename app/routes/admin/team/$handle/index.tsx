import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useOutletContext } from "@remix-run/react";
import { TeamWithAccessRights } from "~/routes/admin/team/$handle";

export default function() {
  const { team } = useOutletContext<{ team: TeamWithAccessRights }>();
  const navigations = ["Details", "Socials", "Members", "Organisation"];
  return <EditOverviewBlock entityId={String(team.team.id)} title={team.team.name} canDelete={team.accessRight === 'ADMINISTRATOR'} type='TEAM' navigations={navigations}/>;
};
