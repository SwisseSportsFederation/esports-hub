import EditOverviewBlock from "~/components/Blocks/EditOverviewBlock";
import { useOutletContext } from "@remix-run/react";
import { OrganisationWithAccessRights } from "~/routes/admin/organisation/$id";

export default function() {
  const { organisation } = useOutletContext<{ organisation: OrganisationWithAccessRights }>();
  const navigations = ["Details", "Socials", "Teams", "Members"];
  return <EditOverviewBlock entityId={String(organisation.organisation.id)} title={organisation.organisation.name}
                            canDelete={organisation.access_rights === 'ADMINISTRATOR'} type='ORG'
                            navigations={navigations}/>;
};
