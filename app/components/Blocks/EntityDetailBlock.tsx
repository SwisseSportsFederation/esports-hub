import type { Canton, Game , EntityType } from '@prisma/client';
import { Form, useFetcher } from '@remix-run/react';
import type { SerializeFrom } from '@remix-run/server-runtime';
import { useState } from 'react';
import ImageUploadBlock from '~/components/Blocks/ImageUploadBlock';
import ActionButton from '~/components/Button/ActionButton';
import DateInput from '~/components/Forms/DateInput';
import DropDownAdder from '~/components/Forms/DropDownAdder';
import DropdownInput from '~/components/Forms/DropdownInput';
import TextareaInput from '~/components/Forms/TextareaInput';
import TextInput from '~/components/Forms/TextInput';
import AskModalBody from '~/components/Notifications/AskModalBody';
import Modal from '~/components/Notifications/Modal';
import H1Nav from '~/components/Titles/H1Nav';
import type { StringOrNull } from '~/db/queries.server';
import { entityToPathSegment } from '~/helpers/entityType';
import type { IdValue, SearchParams } from '~/services/search.server';
import H1 from '../Titles/H1';
import ImageCropBlock from '~/components/Blocks/ImageBlock/ImageCropBlock';
import { EntityTypeValue } from '~/models/database.model';

type EntityDetailBlockProps = {
  entityId: number,
  entityType: EntityType,
  handle: string,
  name: string,
  surname?: string,
  entityBirthday: StringOrNull
  description: string,
  imageId: StringOrNull,
  canton: SerializeFrom<Canton> | null,
  languages: IdValue[],
  searchParams: SearchParams,
  street?: StringOrNull,
  game?: SerializeFrom<Game>,
  zip?: StringOrNull,
  country?: StringOrNull,
  create: boolean
}

const EntityDetailBlock = (props: EntityDetailBlockProps) => {
  const {
    handle,
    entityId,
    imageId,
    name,
    description,
    street,
    zip,
    canton,
    searchParams,
    languages,
    entityType,
    entityBirthday,
    surname,
    game,
    create = false,
  } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [profilePicReady, setProfilePicReady] = useState(true);
  const fetcher = useFetcher();
  const handleDelete = () => {
    setModalOpen(false);
    const path = entityToPathSegment(entityType);
    fetcher.submit({
      entityId: entityId.toString(),
    }, {
      method: 'delete',
      action: `/admin/api/${path}`,
    });
  };

  let path = `/admin/${entityToPathSegment(entityType)}`;
  if (entityType !== EntityTypeValue.USER) {
    path = `${path}/${handle}`;
  }
  const date = entityBirthday ? new Date(entityBirthday) : null;
  return <>
    <div className="mx-3">
      <div className="w-full max-w-prose mx-auto">
        {!create && <H1Nav path={path} title="Details"/>}
        {create && <H1>Create {entityType.toLocaleLowerCase()}</H1>}
        <div className="max-w-md mx-auto mb-6">
          {!create && <ImageUploadBlock entityId={entityId} entity={entityType} imageId={imageId}/>}
        </div>
        <Form method="post" className="space-y-6 flex flex-col items-center max-w-md mx-auto"
              encType="multipart/form-data">
          {create && <ImageCropBlock profilePicReady={profilePicReady}
                                     setProfilePicReady={setProfilePicReady}/>}
          <input name="id" type="hidden" value={String(entityId)}/>
          <input name="oldHandle" type="hidden" value={handle}/>
          <input name="entityType" type="hidden" value={entityType}/>
          <TextInput id="handle" label="Short Name" defaultValue={handle} required={true}/>
          <TextInput id="name" label="Name" defaultValue={name} required={true}/>
          {
            entityType === EntityTypeValue.USER &&
              <TextInput id="surname" label="Surname" defaultValue={surname ?? ''} required={true}/>
          }
          <DateInput name={entityType === EntityTypeValue.USER ? 'birthDate' : 'founded'}
                     label={entityType === EntityTypeValue.USER ? 'Birthdate' : 'Founded'} value={date}
                     min={new Date(1900, 0, 0)} max={new Date()}/>
          {
            entityType === EntityTypeValue.TEAM &&
              <div className="relative w-full max-w-sm lg:max-w-full">
                  <label>
                      <span className={`absolute text-xs left-4 -top-4 transition-all text-color`}>Game *</span>
                  </label>
                  <DropdownInput name="game" selected={game ?? null} inputs={searchParams.games} isBig={true}
                                 className="mt-1 block" showDefaultOption={false} required={true}/>
              </div>
          }

          <TextareaInput id="description" label="Description" value={description} required={true}/>
          {
            entityType === EntityTypeValue.ORGANISATION &&
              <TextInput id="street" label="Street" defaultValue={street ?? ''}/>
          }
          {
            entityType === EntityTypeValue.ORGANISATION &&
              <TextInput id="zip" label="Zip" defaultValue={zip ?? ''}/>
          }
          <div className="relative w-full max-w-sm lg:max-w-full">
            <label>
              <span className={`absolute left-4 text-xs -top-4 text-color`}>Canton</span>
            </label>
            <DropdownInput name="canton" selected={canton ?? null} inputs={searchParams.cantons}
                           sendDefaultOption={false} isBig={true} className="mt-1 block"
                           defaultOption={{id: '', name: ''}}/>
          </div>
          <DropDownAdder name="languages" label="Language" values={searchParams.languages}
                         defaultValues={languages}/>
          <ActionButton content="Save" type="submit" disabled={!profilePicReady}/>
        </Form>
      </div>
    </div>
    {entityType === EntityTypeValue.USER &&
        <div className="bg-red-600/25 py-8 lg:py-12 my-8 px-5">
            <div className="w-full max-w-prose mx-auto">
                <H1>Danger Zone</H1>
                <div className="flex flex-col items-center max-w-md mx-auto mt-8 gap-4">
                    <ActionButton content="Change Password" action={() => fetcher.submit({}, {
                      action: '/admin/api/password',
                      method: 'post',
                    })}/>
                    <ActionButton content="Delete" action={() => setModalOpen(true)}/>
                </div>
            </div>
        </div>
    }
    <Modal isOpen={modalOpen} handleClose={() => setModalOpen(false)}>
      <AskModalBody message={`Do you really want to delete your account?`}
                    primaryButton={{text: 'Yes', onClick: handleDelete}}
                    secondaryButton={{text: 'No', onClick: () => setModalOpen(false)}}/>
    </Modal>

  </>;
};

export default EntityDetailBlock;
