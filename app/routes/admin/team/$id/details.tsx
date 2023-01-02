import styles from 'react-image-crop/dist/ReactCrop.css'
import { useOutletContext } from "@remix-run/react";
import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import { TeamWithAccessRights } from "~/routes/admin/team/$id";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function() {
  const { team: teamData } = useOutletContext<{ team: TeamWithAccessRights }>();
  const { team } = teamData;
  return <ImageUploadBlock entityId={Number(team.id)} entity={'TEAM'} imageId={team.image}/>;
}
