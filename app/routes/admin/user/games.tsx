import H1Nav from "~/components/Titles/H1Nav";
import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { getSearchParams } from "~/services/search.server";
import { zx } from 'zodix';
import { z } from "zod";
import DropDownAdder from "~/components/Forms/DropDownAdder";
import ActionButton from "~/components/Button/ActionButton";
import { createFlashMessage } from "~/services/toast.server";
import { ActionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionArgs) => {
  const { games } = await zx.parseForm(request, {
    games: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const gameIds = (JSON.parse(games) as string[]).map(gameId => ({ id: Number(gameId) }));
    await db.user.update({
      where: {
        id: Number(user.db.id)
      },
      data: {
        games: {
          set: gameIds
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

  const userDetail = await db.user.findFirst({
    where: {
      id: Number(user.db.id)
    },
    include: {
      games: true
    }
  });

  return json({
    games: userDetail?.games || [],
    user,
    searchParams: await getSearchParams()
  });
}

export default function() {
  const { games, user, searchParams } = useLoaderData<typeof loader>();

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav path={'/admin/user'} title='Games'/>

      <Form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <DropDownAdder name="games" label="Games" values={searchParams.games}
                        defaultValues={games}/>
        <ActionButton content='Save' name='save-button' value='Save' type='submit'/>
      </Form>
    </div>
  </div>;
};
