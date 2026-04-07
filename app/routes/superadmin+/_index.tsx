import type { EntityType, Game, User } from "@prisma/client";
import type { FetcherWithComponents } from "@remix-run/react";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/server-runtime";
import IconButton from "~/components/Button/IconButton";
import TextInput from "~/components/Forms/TextInput";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import H1 from "~/components/Titles/H1";
import { getGameRequests, getSuperAdmins, getTcgAdmins } from "~/services/superadmin/index.server";
import { checkUserAuth } from "~/utils/auth.server";
import type { loader as superadminLoader } from "~/routes/superadmin+/_layout";
import { useOutletContext } from "@remix-run/react";


export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const { gameRequests, similarGames } = await getGameRequests(user);
  const superadmins = await getSuperAdmins(user);
  const tcgAdmins = await getTcgAdmins(user);
  return json({
    gameRequests,
    similarGames,
    superadmins,
    tcgAdmins
  });
}

const getRequestTeaser = (requests: SerializeFrom<Pick<Game, 'id' | 'name'>>[], similarGames: SerializeFrom<Pick<Game, 'id' | 'name'>>[], userId: string, fetcher: FetcherWithComponents<any>): JSX.Element => {
  return <div>
    {requests.map(request => {
      return <div className={`w-full flex items-center max-w-lg p-3 pr-16 my-2 rounded-xl bg-white dark:bg-gray-2`}>
        <div className="flex-grow overflow-hidden">
          <div className="mx-1 flex items-center gap-3">
            <span className="font-bold break-all block">{request.name}</span>
          </div>
        </div>
        <fetcher.Form method='post' action={`/superadmin/api/game/request`} className="flex space-x-2">
          <input type='hidden' name='entityId' value={`${request.id}`} />
          <input type='hidden' name='userId' value={userId} />
          <IconButton icon='accept' type='submit' name='action' value='ACCEPT' />
          <IconButton icon='decline' type='submit' name='action' value='DECLINE' />
        </fetcher.Form>
      </div>;
    })}
    {similarGames.map(game => {
      return <div className={`w-full flex items-center max-w-lg p-3 pr-16 my-2 rounded-xl bg-yellow-600`}>
        <div className="flex-grow overflow-hidden">
          <div className="mx-1 flex items-center gap-3">
            <span className="font-bold break-all block">similar: {game.name}</span>
          </div>
        </div>
      </div>;
    })}
  </div>
}

const getSuperAdminTeaser = (invitations: SerializeFrom<User>[], type: EntityType): ITeaserProps[] => {
  return invitations.map(invitation => {
    return {
      type,
      id: String(invitation.id),
      handle: invitation.handle,
      avatarPath: invitation.image ?? null,
      name: invitation.name,
      team: invitation.handle,
      games: []
    }
  });
}

export default function () {
  const { gameRequests, similarGames, superadmins, tcgAdmins } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<SerializeFrom<typeof superadminLoader>>();
  const fetcher = useFetcher();

  const superadminTeasers = getSuperAdminTeaser(superadmins, 'USER');
  const gameRequestTeasers = getRequestTeaser(gameRequests, similarGames as SerializeFrom<Pick<Game, 'id' | 'name'>>[], String(user.db.id), fetcher);

  return <div className="mt-5 flex flex-col">
    <div className="max-w-xl">
      <H1 className={`mx-2 px-2 mb-1`}>Game Requests</H1>
      <div className="w-full">
        {gameRequestTeasers}
      </div>
      <div className="w-full flex mt-4 mb-16">
        <fetcher.Form method='post' action={`/admin/api/game`} className="flex space-x-2 items-center">
          <TextInput id="name" label="Name" defaultValue={""} className="!mt-0" />
          <IconButton icon='add' type='submit' name='action' value='POST' />
        </fetcher.Form>
      </div>
      <div className="bg-red-400 bg-opacity-50 p-4 rounded-xl w-full">
        <H1 className={`mx-2 px-2 mb-1`}>Super Admins</H1>
        <TeaserList title="" teasers={superadminTeasers} />
        <div className={`flex mt-4`}>
          <fetcher.Form method='post' action={`/superadmin/api/user/superadmin`} className="flex space-x-2 items-center">
            <TextInput id="handle" label="User Handle" defaultValue={""} className="!mt-0" />
            <IconButton icon='add' type='submit' name='action' value='POST' />
          </fetcher.Form>
        </div>
      </div>
      <div className="bg-blue-400 bg-opacity-50 p-4 rounded-xl w-full mt-4">
        <H1 className={`mx-2 px-2 mb-1`}>TCG Admins</H1>
        <div className="flex flex-col gap-2 mt-4">
          {tcgAdmins.map(admin => (
            <div key={String(admin.id)} className={`w-full flex items-center max-w-lg p-3 pr-4 rounded-xl bg-white dark:bg-gray-2`}>
              <div className="flex-grow overflow-hidden">
                <span className="font-bold break-all block mx-1">{admin.handle}</span>
              </div>
              <fetcher.Form method='post' action={`/superadmin/api/user/tcgadmin`}>
                <input type='hidden' name='handle' value={admin.handle} />
                <IconButton icon='decline' type='submit' name='action' value='DELETE' />
              </fetcher.Form>
            </div>
          ))}
        </div>
        <div className={`flex mt-6`}>
          <fetcher.Form method='post' action={`/superadmin/api/user/tcgadmin`} className="flex space-x-2 items-center">
            <TextInput id="handle" label="User Handle" defaultValue={""} className="!mt-0" />
            <IconButton icon='add' type='submit' name='action' value='POST' />
          </fetcher.Form>
        </div>
      </div>
    </div>
  </div>;
}
