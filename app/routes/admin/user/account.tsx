import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import styles from 'react-image-crop/dist/ReactCrop.css'
import dateInputStyles from "~/styles/date-input.css";
import { json, ActionArgs } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { Language } from "@prisma/client";
import TextInput from "~/components/Forms/TextInput";
import H1Nav from "~/components/Titles/H1Nav";
import ActionButton from "~/components/Button/ActionButton";
import LinkBlock from "~/components/Blocks/LinkBlock";
import DateInput from "~/components/Forms/DateInput";
import TextareaInput from "~/components/Forms/TextareaInput";
import DropdownInput from "~/components/Forms/DropdownInput";
import { getSearchParams } from "~/services/search.server";
import DropDownAdder from "~/components/Forms/DropDownAdder";
import { LoaderFunctionArgs } from "@remix-run/router";
import { zx } from 'zodix';
import { z } from "zod";

export function links() {
  return [{ rel: "stylesheet", href: styles },{ rel: "stylesheet", href: dateInputStyles }];
}

const getLanguages = async (formData: FormData) => {
  if(formData.get("languages[]") !== "All") {
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
    return {
      languages: {
        set: languages.map((language: Language) => {return {id: language.id}})
      }
    };
  }
  return undefined;
}

export const action = async ({ request }: ActionArgs) => {
  const { handle, name, surname, birthDate, description, canton: cantonForm } = await zx.parseForm(request, {
    handle: z.string(),
    name: z.string(),
    surname: z.string(),
    birthDate: z.string(),
    description: z.string(),
    canton: z.string()
  });
  const formData = await request.formData();
  const user = await checkUserAuth(request);
  let canton = undefined;
  if(cantonForm !== "All") {
    canton = await db.canton.findFirst({ where: {
      name: cantonForm
    }})
  }
  let languages = await getLanguages(formData);
  const userData = await db.user.update({
    where: {
      id: Number(user.db.id)
    },
    data: {
      handle: handle,
      name: name,
      surname: surname,
      birth_date: new Date(birthDate),
      description: description,
      canton: {
        connect: {
          id: canton.id
        }
      },
      ...languages
    }
  });
  return null;

  /* TODO: Handle Errors */
  /*
  if (error) {
    addNotification("Error", 3000);
    console.error(error);
    return;
  }

  addNotification("Success", 3000);
  */
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const userData = await db.user.findFirst({
    where: {
      id: Number(user.db.id)
    },
    include: {
      canton: true,
      languages: true,
      games: true
    }
  })

  return json({ 
    user: userData,
    searchParams: await getSearchParams() 
  });
}

export default function() {
  const { user, searchParams } = useLoaderData<typeof loader>();
  const birthDate = user.birth_date ? new Date(user.birth_date) : new Date();
  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={`/admin/user`}>Account</H1Nav>
      <form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <div className="w-full max-w-sm lg:max-w-full">
          <ImageUploadBlock entityId={Number(user.id)} entity={'USER'} imageId={user.image}/>
        </div>
        <TextInput id="handle" label="Nickname" defaultValue={user.handle} required={true} />
        <TextInput id="name" label="Name" defaultValue={user.name} required={true} />
        <TextInput id="surname" label="Surname" defaultValue={user.surname} />
        <DateInput name="birthDate" label="Birthdate" value={birthDate} min={new Date(1900, 0, 0)} max={new Date()} />
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
