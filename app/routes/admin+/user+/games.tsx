import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { zx } from 'zodix';
import ActionButton from "~/components/Button/ActionButton";
import ComboboxAdder from "~/components/Forms/ComboboxAdder";
import { ToastMessageListener } from "~/components/Notifications/ToastMessageListener";
import H1Nav from "~/components/Titles/H1Nav";
import { db } from "~/services/db.server";
import type { IdValue } from "~/services/search.server";
import { getActiveGames } from "~/services/search.server";
import { checkUserAuth } from "~/utils/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
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
  } catch (error) {
    console.log(error);
    return json({}, 500);
  }
  return json({ toast: 'Account update is done' });
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);

  const userDetail = await db.user.findFirst({
    where: {
      id: Number(user.db.id)
    },
    include: {
      games: {
        where: {
          is_active: true,
        },
      }
    }
  });

  const games = userDetail?.games.map(game => {
    return {
      id: game.id.toString(),
      name: game.name
    }
  }) ?? [];

  return json({
    games,
    user,
    activeGames: await getActiveGames()
  });
}

export default function () {
  const { games, user, activeGames } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  let [gameList, setGameList] = useState(activeGames);

  const checkNewInput = async (element: IdValue) => {
    if (element.id === null) {
      fetcher.submit({
        name: element.name
      }, {
        method: 'post',
        action: `/admin/api/game`
      });
      // setGameList((await getActiveGames()));
    }
  }

  return <div>
    <div className="w-full max-w-prose mx-auto lg:mx-0">
      <H1Nav paths={{ small: '/admin/user', big: '/admin', breakpoint: 'lg' }} title='Games' />

      <Form method="post" className='space-y-6 flex flex-col items-center max-w-lg mx-auto lg:mx-0 lg:items-start'>
        <ComboboxAdder name="games" label="Games" values={gameList}
          defaultValues={games} onChange={checkNewInput} />
        <ActionButton content='Save' name='save-button' value='Save' type='submit' />
      </Form>
    </div>
    <ToastMessageListener />
  </div>;
};
