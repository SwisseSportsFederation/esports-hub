import ActionButton from "../Button/ActionButton";
import H1Nav from "../Titles/H1Nav";
import IconTitle from "../Titles/IconTitle";
import LinkBlock from "./LinkBlock";
import { entityToPathSegment, EntityType } from "~/helpers/entityType";
import Modal from "~/components/Notifications/Modal";
import { useState } from "react";
import AskModalBody from "~/components/Notifications/AskModalBody";
import { useFetcher } from "@remix-run/react";

interface IEditOverviewBlockProps {
  entityId: string,
  type: EntityType
  title: string,
  navigations: string[],
  canDelete: boolean
}

const EditOverviewBlock = ({ entityId, title, type, navigations = [], canDelete }: IEditOverviewBlockProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const fetcher = useFetcher();

  const handleDelete = () => {
    setModalOpen(false);
    const path = entityToPathSegment(type);
    fetcher.submit({
      entityId
    }, {
      method: 'delete',
      action: `/admin/api/${path}`
    })
  };

  return <>
    <div className="max-w-prose mx-auto w-full px-4">
      <H1Nav path="/admin">Back</H1Nav>
      <IconTitle type={type}>{title}</IconTitle>
      {navigations.map((navigation: string, index: number) =>
        <div key={index} className="mb-4">
          <LinkBlock path={`${navigation.toLowerCase()}`} title={navigation}/>
        </div>
      )}
      {canDelete &&
        <ActionButton content='Delete' action={() => setModalOpen(true)} className="mt-8"/>
      }
    </div>
    <Modal isOpen={modalOpen} handleClose={() => setModalOpen(false)}>
      <AskModalBody message={`Do you really want to delete ${title}`}
                    primaryButton={{ text: 'Yes', onClick: handleDelete }}
                    secondaryButton={{ text: 'No', onClick: () => setModalOpen(false) }}/>
    </Modal>
  </>;
};

export default EditOverviewBlock;
