import H1Nav from "~/components/Titles/H1Nav";
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { getSearchParams } from "~/services/search.server";
import { zx } from 'zodix';
import { z } from "zod";
import ActionButton from "~/components/Button/ActionButton";
import { createFlashMessage } from "~/services/toast.server";
import { ActionArgs } from "@remix-run/node";
import ComboboxAdder from "~/components/Forms/ComboboxAdder";
import type { IdValue } from "~/services/search.server";
import { useState } from "react";

export const action = async ({ request }: ActionArgs) => {
  const { games } = await zx.parseForm(request, {
    games: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const gameIds = (JSON.parse(games) as string[]).filter(gameId => gameId !== null).map(gameId => ({ id: Number(gameId) }));
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
  const fetcher = useFetcher();
  let [gameList, setGameList] = useState(searchParams.games);

  const checkNewInput = async (element: IdValue) => {
    if(element.id === null) {
      fetcher.submit({
        name: element.name
      }, {
        method: 'post',
        action: `/admin/api/game`
      });
      setGameList((await getSearchParams()).games);
    }
  }

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav paths={{ small: '/admin/user', big: '/admin', breakpoint: 'lg' }} title='Games'/>

      <Form method="post" className='space-y-6 flex flex-col items-center max-w-md mx-auto'>
        <ComboboxAdder name="games" label="Games" values={gameList}
                        defaultValues={games} onChange={checkNewInput}/>
        <ActionButton content='Save' name='save-button' value='Save' type='submit'/>
      </Form>
    </div>
  </div>;
};
