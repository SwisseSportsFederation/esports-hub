import styles from 'react-image-crop/dist/ReactCrop.css'
import { useOutletContext } from "@remix-run/react";
import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import { TeamWithAccessRights } from "~/routes/admin/team/$handle";
import { json, ActionArgs } from "@remix-run/node";
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
  const { handle, name, game: gameForm, website, description, canton: cantonForm } = await zx.parseForm(request, {
    handle: z.string(),
    name: z.string(),
    game: z.string(),
    website: z.string(),
    description: z.string(),
    canton: z.string()
  });
  const formData = await request.formData();

  await checkUserAuth(request);

  let canton = undefined;
  if(cantonForm !== "All") {
    canton = await db.canton.findFirst({ where: {
      name: cantonForm
    }})
  }
  let game = undefined;
  if(gameForm !== "All") {
    game = await db.game.findFirst({ where: {
      name: gameForm
    }})
  }
  let languages = await getLanguages(formData);
  const userData = await db.team.update({
    where: {
      handle
    },
    data: {
      handle,
      name,
      game: {
        connect: {
          id: game.id
        }
      },
      website,
      description,
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
  return json({ 
    searchParams: await getSearchParams() 
  });
}

export default function() {
  const { searchParams } = useLoaderData<typeof loader>();
  const { team: teamData } = useOutletContext<{ team: TeamWithAccessRights }>();
  const { team } = teamData;
  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={`/admin/team/${team.handle}`}>Details</H1Nav>
      <form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <div className="w-full max-w-sm lg:max-w-full">
          <ImageUploadBlock entityId={Number(team.id)} entity={'TEAM'} imageId={team.image}/>
        </div>
        <TextInput id="name" label="Name" defaultValue={team.name} required={true} />
        <TextInput id="handle" label="Short Name" defaultValue={team.handle} required={true} />
        <div className="w-full max-w-sm lg:max-w-full">
          <label><span className={`absolute left-4 top-6 transition-all text-black`}>Game</span></label>
          <DropdownInput name="game" selected={team.game.name} inputs={searchParams.games || []} isBig={true} className="mt-1 block"/>
        </div>
        <TextInput id="website" label="Website" defaultValue={team.website} />
        <TextareaInput id="description" label="Description" value={team.description} />
        <div className="w-full max-w-sm lg:max-w-full">
          <label><span className={`absolute left-4 top-6 transition-all text-black`}>Canton</span></label>
          <DropdownInput name="canton" selected={team.canton.name} inputs={searchParams.cantons || []} isBig={true} className="mt-1 block"/>
        </div>
        <DropDownAdder name="languages[]" label="Language" values={searchParams.languages || []} defaultValues={team.languages.map((language: Language) => language.name) || []} />
        <ActionButton content='Save' type='submit' />
      </form>
    </div>
  </div>;
}