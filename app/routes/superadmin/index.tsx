import { json } from "@remix-run/node";
import type { FetcherWithComponents } from "@remix-run/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import TeaserList from "~/components/Teaser/TeaserList";
import type { EntityType } from "~/helpers/entityType";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import { SerializeFrom } from "@remix-run/server-runtime";
import { checkSuperAdmin, checkUserAuth } from "~/utils/auth.server";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { Game, User } from "@prisma/client";
import { getGameRequests, getSuperAdmins } from "~/services/superadmin/index.server";
import TextInput from "~/components/Forms/TextInput";


export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  await checkSuperAdmin(user.db.id);
  const games = await getGameRequests(user);
  const superadmins = await getSuperAdmins(user);
  return json({
    user,
    games,
    superadmins
  });
}

const getRequestTeaser = (requests: SerializeFrom<Game>[], userId: string, fetcher: FetcherWithComponents<any>): JSX.Element[] => {
  return requests.map(request => {
      return <div className={`w-full flex items-center max-w-lg p-3 pr-16 my-2 rounded-xl bg-white dark:bg-gray-2`}>
        <div className="flex-grow overflow-hidden">
          <div className="mx-1 flex items-center gap-3">
            <span className="font-bold break-all block">{request.name}</span>
          </div>
        </div>
        <fetcher.Form method='post' action={`/superadmin/api/game/request`} className="flex space-x-2">
          <input type='hidden' name='entityId' value={`${request.id}`}/>
          <input type='hidden' name='userId' value={userId}/>
          <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
          <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
        </fetcher.Form>
      </div>;
    });
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

export default function() {
  const { user, games, superadmins } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const superadminTeasers = getSuperAdminTeaser(superadmins, 'USER')
  const gameRequestTeasers = getRequestTeaser(games, user.db.id, fetcher);

  return <div className="mt-5 flex flex-col xl:ml-0 lg:ml-72 ml-0">
    <div className="max-w-prose mx-auto">
      <H1 className={`mx-2 px-2 mb-1`}>Game Requests</H1>
      { gameRequestTeasers }
      <div className="flex justify-center mt-4 mb-8">
        <fetcher.Form method='post' action={`/admin/api/game`} className="flex space-x-2">
          <TextInput id="name" label="Name" defaultValue={""}/>
          <IconButton icon='add' type='submit' name='action' value='POST'/>
        </fetcher.Form>
      </div>
      <H1 className={`mx-2 px-2 mb-1`}>Super Admins</H1>
      <TeaserList title="" teasers={superadminTeasers}/>
      <div className={`flex justify-center mt-4`}>
        <fetcher.Form method='post' action={`/superadmin/api/user/superadmin`} className="flex space-x-2">
          <TextInput id="handle" label="User Handle" defaultValue={""}/>
          <IconButton icon='add' type='submit' name='action' value='POST'/>
        </fetcher.Form>
      </div>
    </div>
  </div>;
};
