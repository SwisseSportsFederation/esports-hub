import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { FetcherWithComponents } from "@remix-run/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import BlockTeaser from "~/components/Teaser/BlockTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import { checkUserAuth } from "~/utils/auth.server";
import type { Invitation, Membership } from "~/services/admin/index.server";
import { getUserMemberships } from "~/services/admin/index.server";
import type { AuthUser } from "~/services/auth.server";
import type { EntityType } from "~/helpers/entityType";
import { entityToPathSegment } from "~/helpers/entityType";
import { ITeaserProps } from "~/components/Teaser/Teaser";
import classNames from "classnames";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await checkUserAuth(request);
  const memberships = await getUserMemberships(user);
  return json({
    user,
    memberships
  });
};

const getTeaser = (memberships: Membership[], entity: EntityType): ITeaserProps[] => {
  return memberships.map((mem: Membership) => {
    const pathSegment = entityToPathSegment(entity);
    const icons = <IconButton icon='edit' type='link' path={`/admin/${pathSegment}/${mem.id}`}/>;
    return {
      type: entity,
      id: Number(mem.id),
      avatarPath: mem.image ?? null,
      name: mem.name,
      team: mem.short_name,
      games: [],
      icons
    }
  });
};


const getInvitationTeaser = (invitations: Invitation[], fetcher: FetcherWithComponents<any>, user: AuthUser): ITeaserProps[] => {
  return invitations.map(invitation => {
    const path = entityToPathSegment(invitation.type)
    const icons = <fetcher.Form method='post' action={`/admin/api/${path}/invitation`}>
      <input type='hidden' name='entity' value={invitation.type}/>
      <input type='hidden' name='entityId' value={Number(invitation.id)}/>
      <input type='hidden' name='userId' value={Number(user.db.id)}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;

    return {
      type: invitation.type,
      id: Number(invitation.id),
      avatarPath: invitation.image ?? null,
      name: invitation.name,
      team: invitation.short_name,
      games: [],
      icons
    }
  });
}


export default function() {
  const { memberships, user } = useLoaderData();
  const fetcher = useFetcher();

  const teamsTeaser = getTeaser(memberships.teams, 'TEAM');
  const orgTeaser = getTeaser(memberships.orgs, 'ORG');

  const invitationTeaser = getInvitationTeaser(memberships.invitations, fetcher, user)

  const addOrgClassNames = classNames({
    'mb-4': invitationTeaser.length > 0,
    'mb-0': invitationTeaser.length === 0
  })

  return <div className="max-w-prose	mx-auto">
    <H1 className="mx-2 px-2">Personal</H1>
    <div className="flex w-full relative justify-center flex-wrap mb-2">
      <BlockTeaser text="Profile" icon='user'  path={`user`}/>
      <BlockTeaser text="Teams" icon="team" path={`teams`}/>
      <BlockTeaser text="Organisations" icon="organisation" path={`organisations`}/>
    </div>
    <TeaserList title="Your Teams" teasers={teamsTeaser}/>
    <div className="flex justify-center mt-4 mb-8">
      <IconButton icon={"add"} type='link' path="/admin/teams/0/details"/>
    </div>
    <TeaserList title="Your Organisations" teasers={orgTeaser}/>
    <div className={`flex justify-center mt-4 ${addOrgClassNames}`}>
      <IconButton icon={"add"} type='link' path="/admin/organisations/0/details"/>
    </div>
    { invitationTeaser.length > 0 &&
      <TeaserList title="Your invitations" teasers={invitationTeaser} />
    }
  </div>;
};
