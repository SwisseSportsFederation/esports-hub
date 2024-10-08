import type { FetcherWithComponents } from "@remix-run/react";
import { useFetcher, useOutletContext } from "@remix-run/react";
import H1 from "~/components/Titles/H1";
import IconButton from "~/components/Button/IconButton";
import BlockTeaser from "~/components/Teaser/BlockTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import type { Membership } from "~/services/admin/index.server";
import type { EntityType } from "@prisma/client";
import { entityToPathSegment } from "~/helpers/entityType";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import classNames from "classnames";
import type { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin+/_layout";
import { RequestStatusValue } from '~/models/database.model';

const getTeaser = (memberships: SerializeFrom<Membership>[], entity: EntityType): ITeaserProps[] => {
  return memberships.filter(mem => mem.group_type === entity).map((mem: SerializeFrom<Membership>) => {
    const pathSegment = entityToPathSegment(entity);
    const canEdit = ['MODERATOR', 'ADMINISTRATOR'].includes(mem.access_rights)
    const icons = canEdit ?
      <IconButton icon='edit' type='link' path={`/admin/${pathSegment}/${mem.handle}`} /> : undefined;
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

const getInvitationTeaser = (invitations: SerializeFrom<Membership>[], entity: EntityType, userId: string, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.filter(invitation => invitation.request_status === RequestStatusValue.PENDING_USER && invitation.group_type === entity)
    .map(invitation => {
      const icons = <fetcher.Form method='post' action={`/admin/api/invitation`} className="flex space-x-2">
        <input type='hidden' name='entityId' value={`${invitation.id}`} />
        <input type='hidden' name='userId' value={userId} />
        <IconButton icon='accept' type='submit' name='action' value='ACCEPT' />
        <IconButton icon='decline' type='submit' name='action' value='DECLINE' />
      </fetcher.Form>;

      return {
        type: entity,
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

export default function () {
  const { memberships, user } = useOutletContext<SerializeFrom<typeof adminLoader>>();
  const fetcher = useFetcher();
  const teamsTeaser = getTeaser(memberships.groups, 'TEAM');
  const orgTeaser = getTeaser(memberships.groups, 'ORGANISATION');

  const teamInvitationTeaser = getInvitationTeaser(memberships.groupInvitations, 'TEAM', user.db.id, fetcher);
  const orgInvitationTeaser = getInvitationTeaser(memberships.groupInvitations, 'ORGANISATION', user.db.id, fetcher);
  const invitationsLength = teamInvitationTeaser.length + orgInvitationTeaser.length;
  const addOrgClassNames = classNames({
    'mb-4': invitationsLength > 0,
    'mb-0': invitationsLength === 0
  })

  return <div className="">
    <div className="lg:hidden">
      <H1 className="px-2">Personal</H1>
      <div className="flex w-full relative justify-center flex-wrap mb-2">
        <BlockTeaser text="Profile" icon='user' path={`user`} />
        <BlockTeaser text="Teams" icon="team" path={`teams`} />
        <BlockTeaser text="Organisations" icon="organisation" path={`organisations`} />
      </div>
    </div>
    <H1 className={`px-2 mb-1`}>Your Teams</H1>
    <TeaserList title="" teasers={teamsTeaser} />
    <div className="flex justify-center lg:block lg:ml-4 mt-4 mb-8">
      <IconButton icon={"add"} type='link' path="/admin/create/team" />
    </div>
    <H1 className={`px-2 mb-1`}>Your Organisations</H1>
    <TeaserList title="" teasers={orgTeaser} />
    <div className={`flex justify-center lg:block lg:ml-4 mt-4 ${addOrgClassNames}`}>
      <IconButton icon={"add"} type='link' path="/admin/create/organisation" />
    </div>
    {teamInvitationTeaser.length > 0 &&
      <TeaserList title="Team Invitations" teasers={teamInvitationTeaser} />
    }
    {orgInvitationTeaser.length > 0 &&
      <TeaserList title="Organisation Invitations" teasers={orgInvitationTeaser} />
    }
  </div>;
}
