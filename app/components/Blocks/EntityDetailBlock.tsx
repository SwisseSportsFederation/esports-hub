import type { Canton, EntityType, Game } from '@prisma/client';
import { Form } from '@remix-run/react';
import type { SerializeFrom } from '@remix-run/server-runtime';
import { useState } from 'react';
import ImageCropBlock from '~/components/Blocks/ImageBlock/ImageCropBlock';
import ImageUploadBlock from '~/components/Blocks/ImageUploadBlock';
import ActionButton from '~/components/Button/ActionButton';
import DateInput from '~/components/Forms/DateInput';
import DropDownAdder from '~/components/Forms/DropDownAdder';
import DropdownInput from '~/components/Forms/DropdownInput';
import TextareaInput from '~/components/Forms/TextareaInput';
import TextInput from '~/components/Forms/TextInput';
import H1Nav from '~/components/Titles/H1Nav';
import type { StringOrNull } from '~/db/queries.server';
import { entityToPathSegment } from '~/helpers/entityType';
import { EntityTypeValue } from '~/models/database.model';
import type { IdValue, SearchParams } from '~/services/search.server';
import H1 from '../Titles/H1';

type EntityDetailBlockProps = {
  entityId: number,
  entityType: EntityType,
  handle: string,
  name: string,
  surname?: string,
  email?: string,
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
  has_data_policy?: boolean,
  is_searchable?: boolean,
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
    email,
    game,
    has_data_policy = false,
    is_searchable = false,
    create = false,
  } = props;
  const [profilePicReady, setProfilePicReady] = useState(true);

  let path = `/admin/${entityToPathSegment(entityType)}`;
  let bigPath = '/admin'
  if (entityType !== EntityTypeValue.USER) {
    path = `${path}/${handle}`;
    bigPath = path;
  }
  const date = entityBirthday ? new Date(entityBirthday) : null;
  const isUser = entityType === EntityTypeValue.USER;
  return <>
    <div className="w-full mx-auto lg:mx-0">
      {!create && <H1Nav paths={{ small: path, big: bigPath, breakpoint: 'lg' }} title="Details" />}
      {create && <H1>Create {entityType.toLocaleLowerCase()}</H1>}
      {!create &&
        <div className="max-w-prose mx-auto lg:mx-0 mb-6">
          <ImageUploadBlock entityId={entityId} entity={entityType} imageId={imageId} />
        </div>
      }
      <Form method="post" className="space-y-6 flex flex-col items-start max-w-prose mx-auto lg:mx-0"
        encType="multipart/form-data">
        {create && <ImageCropBlock profilePicReady={profilePicReady}
          setProfilePicReady={setProfilePicReady} />}
        <input name="id" type="hidden" value={String(entityId)} />
        <input name="oldHandle" type="hidden" value={handle} />
        <input name="entityType" type="hidden" value={entityType} />
        <TextInput id="handle" label={isUser ? 'Nickname' : 'Short Name'}
          defaultValue={handle} required={true} />
        <TextInput id="name" label={isUser ? 'Firstname' : 'Name'}
          defaultValue={name} required={true} />
        {
          isUser &&
          <>
            <TextInput id="surname" label="Surname" defaultValue={surname ?? ''} />
            <TextInput id="email" label="Email" defaultValue={email ?? ''} placeholder='leeroy.jenkins@example.com' />
          </>
        }
        <DateInput name={isUser ? 'birthDate' : 'founded'}
          label={isUser ? 'Birthdate' : 'Founded'} value={date}
          min={new Date(1900, 0, 0)} max={new Date()} />
        {
          entityType === EntityTypeValue.TEAM &&
          <div className="relative w-full max-w-sm lg:max-w-full">
            <label>
              <span className={`absolute text-xs left-4 -top-4 transition-all text-color`}>Game *</span>
            </label>
            <DropdownInput name="game" selected={game ?? null} inputs={searchParams.games} isBig={true}
              className="mt-1 block" showDefaultOption={false} required={true} />
          </div>
        }

        <TextareaInput id="description" label="Description" value={description} required={true} />
        {
          entityType === EntityTypeValue.ORGANISATION &&
          <>
            <TextInput id="street" label="Street" defaultValue={street ?? ''} />
            <TextInput id="zip" label="Zip" defaultValue={zip ?? ''} />
          </>
        }
        <div className="relative w-full max-w-sm lg:max-w-full">
          <label>
            <span className={`absolute left-4 text-xs -top-4 text-color`}>Canton *</span>
          </label>
          <DropdownInput name="canton" selected={canton ?? null} inputs={searchParams.cantons}
            sendDefaultOption={false} isBig={true} className="mt-1 block"
            defaultOption={{ id: '', name: '' }} required={true} />
        </div>
        <DropDownAdder name="languages" label="Language" values={searchParams.languages}
          defaultValues={languages} required={true} />
        {isUser &&
          <div className="flex my-2 relative flex-row-reverse gap-4">
            <label htmlFor="data-policy" className={!has_data_policy ? '' : 'text-gray-500'}>I have read and agree to the <a href='https://sesf.ch/privacy-policy/' target="_blank" className="text-red-1 hover:underline">privacy policy</a>.</label>
            {!has_data_policy && <input type="checkbox" name="has_data_policy" id="data-policy" defaultChecked={has_data_policy} required />}
            {has_data_policy && <input type="checkbox" name="has_data_policy" id="data-policy" checked={has_data_policy} readOnly={true} /> /* Read only after accept */}
          </div>
        }
        {isUser &&
          <div className="flex my-2 relative flex-row-reverse gap-4">
            <label htmlFor="is-searchable">I want to be findable in the search.</label>
            <input type="checkbox" name="is_searchable" id="is-searchable" defaultChecked={is_searchable} onChange={() => { }} />
          </div>
        }

        <div className="flex w-full justify-center lg:justify-start">
          <ActionButton content="Save" type="submit" disabled={!profilePicReady} />
        </div>
      </Form>
    </div>
  </>;
};

export default EntityDetailBlock;
