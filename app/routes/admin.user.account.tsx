import styles from 'react-image-crop/dist/ReactCrop.css'
import dateInputStyles from "~/styles/date-input.css";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { zx } from 'zodix';
import { z } from "zod";
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import { createFlashMessage } from "~/services/toast.server";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { handle, name, surname, birthDate, description, canton, languages } = await zx.parseForm(request, {
    handle: z.string().min(4),
    name: z.string().min(3),
    surname: z.string().min(3),
    birthDate: z.string().optional(),
    description: z.string().optional(),
    canton: zx.NumAsString.optional(),
    languages: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));
    await db.user.update({
      where: {
        id: Number(user.db.id)
      },
      data: {
        handle,
        name,
        surname,
        ...(birthDate && ({ birth_date: new Date(birthDate) })),
        ...(!birthDate && ({ birth_date: null })),
        description,
        ...(canton && {
          canton: {

            connect: {
              id: canton
            }
          }
        }),
        ...(!canton && {
          canton: {
            disconnect: true
          }
        }),
        languages: {
          set: languageIds
        }
      }
    });
  } catch(error) {
    console.log(error);
    return json({}, 500);
  }
  const headers = await createFlashMessage(request, 'Account update is done');
  return json({}, headers);
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
  });


  if(!userData) {
    throw json({}, 404);
  }

  return json({
    user: userData,
    searchParams: await getSearchParams()
  });
}

export default function() {
  const { user, searchParams } = useLoaderData<typeof loader>();
  return <EntityDetailBlock {...user} entityId={user.id} entityType='USER' entityBirthday={user.birth_date}
                            imageId={user.image} searchParams={searchParams}/>
}
