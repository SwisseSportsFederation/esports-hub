import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { FetcherWithComponents, useFetcher, useLoaderData } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import BlockTeaser from "~/components/Teaser/BlockTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import { checkUserAuth } from "~/utils/auth.server";
import type { ReactNode } from "react";
import type { Invitation, Membership } from "~/services/admin/index.server";
import { getUserMemberships } from "~/services/admin/index.server";
import { AuthUser } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);
  const memberships = await getUserMemberships(user);
  return json({
    user,
    memberships
  });
};

const getTeaser = (memberships: Membership[], icons: ReactNode) => {
  return memberships.map((mem: Membership) => ({
    avatarPath: mem.image ?? null,
    name: mem.name ?? "",
    team: mem.short_name ?? null,
    games: [],
    icons: <>
      {icons}
    </>
  }));
};

const getInvitationTeaser = (invitations: Invitation[], fetcher: FetcherWithComponents<any>, user: AuthUser) => {
  return invitations.map(invitation => {
    const statusIcons = <fetcher.Form method='post' action={'/admin/api/invitation'}>
      <input type='hidden' name='entity' value={invitation.type}/>
      <input type='hidden' name='entityId' value={Number(invitation.id)}/>
      <input type='hidden' name='userId' value={Number(user.db.id)}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;
    return {
      avatarPath: invitation.image ?? null,
      name: invitation.name ?? "",
      team: invitation.short_name ?? null,
      games: [],
      icons: statusIcons
    }
  });
}


export default function() {
  const { memberships, user } = useLoaderData();
  const fetcher = useFetcher();

  const editIcon = <IconButton icon='edit' type='link' path='/admin/teams'/>;

  const teamsTeaser = getTeaser(memberships.teams, editIcon);
  const orgTeaser = getTeaser(memberships.orgs, editIcon);

  const invitationTeaser = getInvitationTeaser(memberships.invitations, fetcher, user)

  return <div className="max-w-prose	mx-auto">
    <H1 className="mx-2 px-2">Personal</H1>
    <div className="flex w-full relative justify-center flex-wrap">
      <BlockTeaser text="Profile" icon="user-solid.svg" path={`user`}/>
      <BlockTeaser text="Teams" icon="teams.svg" path={`teams`}/>
      <BlockTeaser text="Organisations" icon="organisations.svg" path={`organisations`}/>
    </div>
    <TeaserList title="Your Teams" teasers={teamsTeaser}/>
    <div className="flex justify-center mt-4 mb-8">
      <IconButton icon={"add"} type='link' path="/admin/teams/0/details"/>
    </div>
    <TeaserList title="Your Organisations" teasers={orgTeaser}/>
    <div className="flex justify-center mt-4 mb-8">
      <IconButton icon={"add"} type='link' path="/admin/organisations/0/details"/>
    </div>
    { invitationTeaser.length > 0 &&
      <TeaserList title="Your invitations" teasers={invitationTeaser} />
    }
  </div>;
};
