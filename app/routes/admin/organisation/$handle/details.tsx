import styles from 'react-image-crop/dist/ReactCrop.css'
import { useOutletContext } from "@remix-run/react";
import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import { OrganisationWithAccessRights } from "~/routes/admin/organisation/$handle";
import { json, ActionArgs, redirect } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { Language } from "@prisma/client";
import TextInput from "~/components/Forms/TextInput";
import H1Nav from "~/components/Titles/H1Nav";
import ActionButton from "~/components/Button/ActionButton";
import TextareaInput from "~/components/Forms/TextareaInput";
import DropdownInput from "~/components/Forms/DropdownInput";
import { getSearchParams } from "~/services/search.server";
import DropDownAdder from "~/components/Forms/DropDownAdder";
import { LoaderFunctionArgs } from "@remix-run/router";
import { zx } from 'zodix';
import { z } from "zod";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
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
  const { id, handle, name, website, description, street, zip, canton: cantonForm, country } = await zx.parseForm(request, {
    id: z.string(),
    handle: z.string(),
    name: z.string(),
    website: z.string(),
    description: z.string(),
    street: z.string(),
    zip: z.string(),
    canton: z.string(),
    country: z.string()
  });
  const formData = await request.formData();

  await checkUserAuth(request);

  let canton = undefined;
  if(cantonForm !== "All") {
    canton = await db.canton.findFirst({ where: {
      name: cantonForm
    }})
  }
  let languages = await getLanguages(formData);
  await db.organisation.update({
    where: {
      id: Number(id)
    },
    data: {
      handle,
      name,
      website,
      description,
      street,
      zip,
      canton: {
        connect: {
          id: canton.id
        }
      },
      country,
      ...languages
    }
  });
  return redirect(`/admin/organisation/${handle}/details`);

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
  return json({ 
    searchParams: await getSearchParams() 
  });
}

export default function() {
  const { searchParams } = useLoaderData<typeof loader>();
  const { organisation: organisationData } = useOutletContext<{ organisation: OrganisationWithAccessRights }>();
  const { organisation } = organisationData;
  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={`/admin/team/${organisation.handle}`}>Details</H1Nav>
      <form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <div className="w-full max-w-sm lg:max-w-full">
          <ImageUploadBlock entityId={Number(organisation.id)} entity={'ORG'} imageId={organisation.image}/>
        </div>
        <input name="id" type="hidden" value={organisation.id}/>
        <TextInput id="name" label="Name" defaultValue={organisation.name} required={true} />
        <TextInput id="handle" label="Short Name" defaultValue={organisation.handle} required={true} />
        <TextInput id="website" label="Website" defaultValue={organisation.website} />
        <TextareaInput id="description" label="Description" value={organisation.description} />
        <TextInput id="street" label="Street" defaultValue={organisation.street} />
        <TextInput id="zip" label="ZIP" defaultValue={organisation.zip} />
        <div className="w-full max-w-sm lg:max-w-full">
          <label><span className={`absolute left-4 top-6 transition-all text-black`}>Canton</span></label>
          <DropdownInput name="canton" selected={organisation.canton.name} inputs={searchParams.cantons || []} isBig={true} className="mt-1 block"/>
        </div>
        <TextInput id="country" label="Country" defaultValue={organisation.country} />
        <DropDownAdder name="languages[]" label="Language" values={searchParams.languages || []} defaultValues={organisation.languages.map((language: Language) => language.name) || []} />
        <ActionButton content='Save' type='submit' />
      </form>
    </div>
  </div>;
}
