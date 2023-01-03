import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import styles from 'react-image-crop/dist/ReactCrop.css'
import { json, LoaderFunction } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { User } from "@prisma/client";
import TextInput from "~/components/Forms/TextInput";
import H1Nav from "~/components/Titles/H1Nav";
import { dateToFormattedString } from "~/utils/dateHelper";
import ActionButton from "~/components/Button/ActionButton";
import LinkBlock from "~/components/Blocks/LinkBlock";
import DateInput from "~/components/Forms/DateInput";
import TextareaInput from "~/components/Forms/TextareaInput";
import DropdownInput from "~/components/Forms/DropdownInput";
import { getSearchParams, SearchParams } from "~/services/search.server";
import DropDownAdder from "~/components/Forms/DropDownAdder";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

const save = async (e: FormEvent) => {
  e.preventDefault();

  /* TODO: Fix save for Remix */
  /*const token = await getAccessTokenSilently();
  const [, error] = await authenticatedFetch(`/users/${entityId}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  }, token);

  if (error) {
    addNotification("Error", 3000);
    console.error(error);
    return;
  }

  addNotification("Success", 3000);
  await mutate();
  await mutateUser?.();*/
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);
  const userData = await db.user.findFirst({
    where: {
      id: Number(user.db.id)
    }
  })

  return json({ 
    user: userData,
    searchParams: await getSearchParams() 
  });
}

export default function() {
  const { user, searchParams } = useLoaderData<{ user: User, searchParams: SearchParams }>();
  const birthDate = user.birthDate ? new Date(user.birthDate) : new Date();
  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={`/admin/user/${user.id}`}>Account</H1Nav>
      <form onSubmit={save} className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <div className="w-full max-w-sm lg:max-w-full">
          <ImageUploadBlock entityId={Number(user.id)} entity={'USER'} imageId={user.image}/>
        </div>
        <TextInput id="nickname" label="Nickname" defaultValue={user.nickname} required={true} />
        <TextInput id="name" label="Name" defaultValue={user.name} required={true} />
        <TextInput id="surname" label="Surname" defaultValue={user.surname} />
        <DateInput label="Birthdate" value={dateToFormattedString(birthDate)} min={new Date(1900, 0, 0)} max={new Date()} />
        <TextareaInput id="description" label="Description" value={user.description} />
        <div className="w-full max-w-sm lg:max-w-full">
          <label><span className={`absolute left-4 top-6 transition-all text-black`}>Canton</span></label>
          <DropdownInput name="canton" selected={user.canton} inputs={searchParams.cantons || []} isBig={true} className="mt-1 block"/>
        </div>
        <DropDownAdder name="languages" label="Language" values={searchParams.languages || []} selectedValues={user.languages || []} />
        <div className="w-full max-w-sm lg:max-w-full">
          <LinkBlock title="Password" path={`/admin/user/change-password`} />
        </div>
        <ActionButton content='Save' type='submit' />
      </form>
    </div>
  </div>;
}
