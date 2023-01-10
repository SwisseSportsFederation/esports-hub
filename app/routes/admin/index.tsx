import type { FetcherWithComponents } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import BlockTeaser from "~/components/Teaser/BlockTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import type { Invitation, Membership } from "~/services/admin/index.server";
import type { EntityType } from "~/helpers/entityType";
import { entityToPathSegment } from "~/helpers/entityType";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import classNames from "classnames";
import { useOutletContext } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin";

const getTeaser = (memberships: Membership[], entity: EntityType): ITeaserProps[] => {
  return memberships.map((mem: Membership) => {
    const pathSegment = entityToPathSegment(entity);
    const canEdit = ['MODERATOR', 'ADMINISTRATOR'].includes(mem.access_rights)
    const icons = canEdit ?
      <IconButton icon='edit' type='link' path={`/admin/${pathSegment}/${mem.handle}`}/> : undefined;
    return {
      type: entity,
      id: String(mem.id),
      handle: mem.handle,
      avatarPath: mem.image ?? null,
      name: mem.name,
      team: mem.handle,
      games: [],
      icons
    }
  });
};

const getInvitationTeaser = (invitations: Invitation[], userId: string, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.map(invitation => {
    const path = entityToPathSegment(invitation.type)
    const icons = <fetcher.Form method='post' action={`/admin/api/${path}/invitation`}>
      <input type='hidden' name='entityId' value={`${invitation.id}`}/>
      <input type='hidden' name='userId' value={userId}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;

    return {
      type: invitation.type,
      id: String(invitation.id),
      handle: invitation.handle,
      avatarPath: invitation.image ?? null,
      name: invitation.name,
      team: invitation.handle,
      games: [],
      icons
    }
  });
}

export default function() {
  const { memberships, user } = useOutletContext<SerializeFrom<typeof adminLoader>>();
  const fetcher = useFetcher();
  const teamsTeaser = getTeaser(memberships.teams, 'TEAM');
  const orgTeaser = getTeaser(memberships.orgs, 'ORG');

  const invitationTeaser = getInvitationTeaser(memberships.invitations, user.db.id, fetcher);

  const addOrgClassNames = classNames({
    'mb-4': invitationTeaser.length > 0,
    'mb-0': invitationTeaser.length === 0
  })

  return <div className="max-w-prose mx-auto">
      <H1 className="mx-2 px-2 lg:hidden">Personal</H1>
      <div className="flex w-full relative justify-center flex-wrap mb-2 lg:hidden">
        <BlockTeaser text="Profile" icon='user' path={`user`}/>
        <BlockTeaser text="Teams" icon="team" path={`teams`}/>
        <BlockTeaser text="Organisations" icon="organisation" path={`organisations`}/>
      </div>
      <TeaserList title="Your Teams" teasers={teamsTeaser}/>
      <div className="flex justify-center mt-4 mb-8">
        <IconButton icon={"add"} type='link' path="/admin/team/0/details"/>
      </div>
      <TeaserList title="Your Organisations" teasers={orgTeaser}/>
      <div className={`flex justify-center mt-4 ${addOrgClassNames}`}>
        <IconButton icon={"add"} type='link' path="/admin/organisation/0/details"/>
      </div>
      {invitationTeaser.length > 0 &&
        <TeaserList title="Your invitations" teasers={invitationTeaser}/>
      }
    </div>;
};
