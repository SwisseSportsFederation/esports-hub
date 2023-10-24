import type { FetcherWithComponents } from "@remix-run/react";
import { useFetcher, useOutletContext } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import BlockTeaser from "~/components/Teaser/BlockTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import type { Membership } from "~/services/admin/index.server";
import { EntityType } from "@prisma/client";
import { entityToPathSegment } from "~/helpers/entityType";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import classNames from "classnames";
import { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin";
import { RequestStatus } from "@prisma/client";

const getTeaser = (memberships: SerializeFrom<Membership>[], entity: EntityType): ITeaserProps[] => {
  return memberships.map((mem: SerializeFrom<Membership>) => {
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

const getInvitationTeaser = (invitations: SerializeFrom<Membership>[], type: EntityType, userId: string, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.filter(invitation => invitation.request_status === RequestStatus.PENDING_USER)
    .map(invitation => {
      const path = entityToPathSegment(type)
      const icons = <fetcher.Form method='post' action={`/admin/api/${path}/invitation`} className="flex space-x-2">
        <input type='hidden' name='entityId' value={`${invitation.id}`}/>
        <input type='hidden' name='userId' value={userId}/>
        <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
        <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
      </fetcher.Form>;

      return {
        type,
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
  const orgTeaser = getTeaser(memberships.orgs, 'ORGANISATION');

  const teamInvitationTeaser = getInvitationTeaser(memberships.teamInvitations, 'TEAM', user.db.id, fetcher);
  const orgInvitationTeaser = getInvitationTeaser(memberships.orgInvitations, 'ORGANISATION', user.db.id, fetcher);
  const invitationsLength = teamInvitationTeaser.length + orgInvitationTeaser.length;
  const addOrgClassNames = classNames({
    'mb-4': invitationsLength > 0,
    'mb-0': invitationsLength === 0
  })

  return <div className="max-w-prose mx-auto">
    <H1 className="mx-2 px-2 lg:hidden">Personal</H1>
    <div className="flex w-full relative justify-center flex-wrap mb-2 lg:hidden">
      <BlockTeaser text="Profile" icon='user' path={`user`}/>
      <BlockTeaser text="Teams" icon="team" path={`teams`}/>
      <BlockTeaser text="Organisations" icon="organisation" path={`organisations`}/>
    </div>
    <H1 className={`mx-2 px-2 mb-1`}>Your Teams</H1>
    <TeaserList title="" teasers={teamsTeaser}/>
    <div className="flex justify-center mt-4 mb-8">
      <IconButton icon={"add"} type='link' path="/admin/create/team"/>
    </div>
    <H1 className={`mx-2 px-2 mb-1`}>Your Organisations</H1>
    <TeaserList title="" teasers={orgTeaser}/>
    <div className={`flex justify-center mt-4 ${addOrgClassNames}`}>
      <IconButton icon={"add"} type='link' path="/admin/create/organisation"/>
    </div>
    {teamInvitationTeaser.length > 0 &&
      <TeaserList title="Team Invitations" teasers={teamInvitationTeaser}/>
    }
    {orgInvitationTeaser.length > 0 &&
      <TeaserList title="Organisation Invitations" teasers={orgInvitationTeaser}/>
    }
  </div>;
};
