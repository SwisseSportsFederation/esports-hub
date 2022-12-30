import styles from 'react-image-crop/dist/ReactCrop.css'
import { useOutletContext } from "@remix-run/react";
import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import { OrganisationWithAccessRights } from "~/routes/admin/organisation/$id";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function() {
  const { organisation: organisationData } = useOutletContext<{ organisation: OrganisationWithAccessRights }>();
  const { organisation } = organisationData;
  return <ImageUploadBlock entityId={Number(organisation.id)} entity={'ORG'} imageId={organisation.image}/>;
}
