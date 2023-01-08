import H1Nav from "~/components/Titles/H1Nav";
import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import { Form } from "@remix-run/react";
import TextInput from "~/components/Forms/TextInput";
import TextareaInput from "~/components/Forms/TextareaInput";
import DropdownInput from "~/components/Forms/DropdownInput";
import DropDownAdder from "~/components/Forms/DropDownAdder";
import type { Canton, Game } from "@prisma/client";
import ActionButton from "~/components/Button/ActionButton";
import type { StringOrNull } from "~/db/queries.server";
import type { IdValue, SearchParams } from "~/services/search.server";
import type { EntityType } from "~/helpers/entityType";
import { entityToPathSegment } from "~/helpers/entityType";
import LinkBlock from "~/components/Blocks/LinkBlock";
import DateInput from "~/components/Forms/DateInput";
import type { SerializeFrom } from "@remix-run/server-runtime";

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
}

const EntityDetailBlock = (props: EntityDetailBlockProps) => {
  const {
    handle, entityId, imageId, name, description, street, zip, canton,
    searchParams, languages, entityType, entityBirthday, surname, game
  } = props;

  let path = `/admin/${entityToPathSegment(entityType)}`;
  if(entityType !== 'USER') {
    path = `${path}/${handle}`;
  }
  const date = entityBirthday ? new Date(entityBirthday) : null;
  return <>
    <div className="mx-3">
      <div className="w-full max-w-prose mx-auto">
        <H1Nav path={path} title='Details'/>
        <div className="max-w-md mx-auto mb-6">
          <ImageUploadBlock entityId={entityId} entity={entityType} imageId={imageId}/>
        </div>
        <Form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
          <input name="id" type="hidden" value={String(entityId)}/>
          <input name="oldHandle" type="hidden" value={handle}/>
          <TextInput id="handle" label="Short Name" defaultValue={handle} required={true}/>
          <TextInput id="name" label="Name" defaultValue={name} required={true}/>
          {
            entityType === 'USER' &&
            <TextInput id="surname" label="Surname" defaultValue={surname ?? ""} required={true}/>
          }
          <DateInput name={entityType === 'USER' ? "birthDate" : 'founded'} label={entityType === 'USER' ? "Birthdate" : 'Founded'} value={date}
                     min={new Date(1900, 0, 0)} max={new Date()}/>
          {
            entityType === 'TEAM' &&
            <div className="relative w-full max-w-sm lg:max-w-full">
              <label>
                <span className={`absolute text-xs left-4 -top-4 transition-all text-white`}>Game</span>
              </label>
              <DropdownInput name="game" selected={game ?? null} inputs={searchParams.games} isBig={true}
                             className="mt-1 block" showDefaultOption={false}/>
            </div>
          }

          <TextareaInput id="description" label="Description" value={description}/>
          {
            entityType === 'ORG' &&
            <TextInput id="street" label="Street" defaultValue={street ?? ""}/>
          }
          {
            entityType === 'ORG' &&
            <TextInput id="zip" label="Zip" defaultValue={zip ?? ""}/>
          }
          <div className="relative w-full max-w-sm lg:max-w-full">
            <label>
              <span className={`absolute left-4 text-xs -top-4 text-white`}>Canton</span>
            </label>
            <DropdownInput name="canton" selected={canton ?? null} inputs={searchParams.cantons}
                           sendDefaultOption={false} isBig={true} className="mt-1 block"
                           defaultOption={{ id: '', name: '' }}/>
          </div>
          <DropDownAdder name="languages" label="Language" values={searchParams.languages}
                         defaultValues={languages}/>
          {entityType === 'USER' &&
            <div className="w-full max-w-sm lg:max-w-full">
              <LinkBlock title="Password" path={`/admin/user/change-password`}/>
            </div>
          }
          <ActionButton content='Save' type='submit'/>
        </Form>
      </div>
    </div>
  </>;
}

export default EntityDetailBlock;
