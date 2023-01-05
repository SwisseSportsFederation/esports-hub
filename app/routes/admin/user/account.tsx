import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import styles from 'react-image-crop/dist/ReactCrop.css'
import { json, LoaderFunction, ActionArgs } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { User, Language } from "@prisma/client";
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

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const user = await checkUserAuth(request);
  let canton = undefined;
  if(formData.get("canton") !== "All") {
    canton = await db.canton.findFirst({ where: {
      name: formData.get("canton")
    }})
  }
  let languageUpdate = undefined;
  if(formData.get("languages") !== "All") {
    const formLangs: string[] = formData.getAll("languages[]") || [];
    let languages: Language[] = [];
    if(formLangs.length > 0) {
      languages = await db.language.findMany({ where: {
        OR: formLangs.map(language => { 
          return {
            name: { equals: language }
          }
        })
      }})
    }
    languageUpdate = {
      languages: {
        set: languages.map((language: Language) => {return {id: language.id}})
      },
    };
  }
  const userData = await db.user.update({
    where: {
      id: Number(user.db.id)
    },
    data: {
      nickname: formData.get("nickname"),
      name: formData.get("name"),
      surname: formData.get("surname"),
      birth_date: formData.get("birthDate"),
      description: formData.get("description"),
      canton: {
        connect: {
          id: canton.id
        }
      },
      ...languageUpdate
    },
  });
  return null;

  /* TODO: Handle Errors */
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
    },
    select: {
      nickname: true,
      name: true,
      surname: true,
      image: true,
      description: true,
      canton: true,
      languages: true,
      games: true,
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
      <form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <div className="w-full max-w-sm lg:max-w-full">
          <ImageUploadBlock entityId={Number(user.id)} entity={'USER'} imageId={user.image}/>
        </div>
        <TextInput id="nickname" label="Nickname" defaultValue={user.nickname} required={true} />
        <TextInput id="name" label="Name" defaultValue={user.name} required={true} />
        <TextInput id="surname" label="Surname" defaultValue={user.surname} />
        <DateInput label="Birthdate" value={birthDate} min={new Date(1900, 0, 0)} max={new Date()} />
        <TextareaInput id="description" label="Description" value={user.description} />
        <div className="w-full max-w-sm lg:max-w-full">
          <label><span className={`absolute left-4 top-6 transition-all text-black`}>Canton</span></label>
          <DropdownInput name="canton" selected={user.canton.name} inputs={searchParams.cantons || []} isBig={true} className="mt-1 block"/>
        </div>
        <DropDownAdder name="languages[]" label="Language" values={searchParams.languages || []} defaultValues={user.languages.map((language: Language) => language.name) || []} />
        <div className="w-full max-w-sm lg:max-w-full">
          <LinkBlock title="Password" path={`/admin/user/change-password`} />
        </div>
        <ActionButton content='Save' type='submit' />
      </form>
    </div>
  </div>;
}
