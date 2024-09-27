import type { FetcherWithComponents } from '@remix-run/react';
import { useFetcher, useOutletContext } from '@remix-run/react';
import type { SerializeFrom } from '@remix-run/server-runtime';
import { useEffect, useState } from 'react';
import ActionButton from '~/components/Button/ActionButton';
import IconButton from '~/components/Button/IconButton';
import DateInput from '~/components/Forms/DateInput';
import Icons from '~/components/Icons';
import SelectNewAdminModal from '~/components/Modals/SelectNewAdminModal';
import Modal from '~/components/Notifications/Modal';
import ExpandableTeaser from '~/components/Teaser/ExpandableTeaser';
import type { ITeaserProps } from '~/components/Teaser/LinkTeaser';
import TeaserList from '~/components/Teaser/TeaserList';
import H1 from '~/components/Titles/H1';
import H1Nav from '~/components/Titles/H1Nav';
import type { StringOrNull } from '~/db/queries.server';
import type { loader as adminLoader } from '~/routes/admin+/_layout';
import type { Membership } from '~/services/admin/index.server';
import dateInputStyles from '~/styles/date-input.css?url';
import { EntityTypeValue, RequestStatusValue } from '~/models/database.model';
import { useTheme, Theme } from '~/context/theme-provider';

export function links() {
  return [
    { rel: 'stylesheet', href: dateInputStyles },
  ];
}

const getInvitationTeaser = (invitations: SerializeFrom<Membership>[], userId: string, pending: boolean, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.map(invitation => {
    let icons = <fetcher.Form method="post" action={`/admin/api/invitation`} className="flex space-x-2">
      <input type="hidden" name="entityId" value={`${invitation.id}`} />
      <input type="hidden" name="userId" value={userId} />
      <IconButton icon="accept" type="submit" name="action" value="ACCEPT" />
      <IconButton icon="decline" type="submit" name="action" value="DECLINE" />
    </fetcher.Form>;

    if (pending) {
      icons = <Icons iconName="clock" className="h-8 w-8" />;
    }

    return {
      type: EntityTypeValue.ORGANISATION,
      id: String(invitation.id),
      handle: invitation.handle,
      avatarPath: invitation.image ?? null,
      name: invitation.name,
      team: invitation.handle,
      games: [],
      icons,
    };
  });
};

const deleteModal = (isOpen: StringOrNull, activeFunction: Function, text: string, intent: string, submitName: string, userId: string, fetcher: FetcherWithComponents<any>) =>
  <Modal isOpen={!!isOpen} handleClose={() => activeFunction(null)}>
    <div className="flex justify-center text-center text-2xl mb-8 text-color">
      {text}
    </div>
    <fetcher.Form method="post" action={`/admin/api/group/member`} className="flex justify-between gap-2"
      onSubmit={() => activeFunction(null)}>
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="userId" value={userId} />
      {isOpen && <ActionButton content="Yes" type="submit" name={submitName} value={isOpen} />}
      <ActionButton className="bg-gray-3" content="No" action={() => activeFunction(null)} />
    </fetcher.Form>
  </Modal>;

const mainOrgIcon = (groupId: string, isMainOrg: boolean | null, theme: string, userId: string, fetcher: FetcherWithComponents<any>) =>
  <fetcher.Form method="post" action={`/admin/api/group/member`}
    className={isMainOrg ? 'text-yellow-400' : theme === Theme.DARK ? 'text-gray-3' : 'text-white'}>
    <input type="hidden" name="intent" value="CHANGE_MAIN_GROUP" />
    <input type="hidden" name="userId" value={userId} />
    <IconButton icon="star" type="submit" name="groupId" value={groupId} className="rounded-none mx-1" />
  </fetcher.Form>;


export default function () {
  const fetcher = useFetcher();
  const [theme] = useTheme();
  const { user, memberships } = useOutletContext<SerializeFrom<typeof adminLoader>>();
  const organisations = memberships.groups.filter(group => group.group_type === EntityTypeValue.ORGANISATION);

  const invitedOrganisations = memberships.groupInvitations.filter(e => e.request_status === RequestStatusValue.PENDING_USER && e.group_type === EntityTypeValue.ORGANISATION);
  const pendingOrganisations = memberships.groupInvitations.filter(e => e.request_status === RequestStatusValue.PENDING_GROUP && e.group_type === EntityTypeValue.ORGANISATION); //pending org

  const invited = getInvitationTeaser(invitedOrganisations, user.db.id, false, fetcher);
  const pending = getInvitationTeaser(pendingOrganisations, user.db.id, true, fetcher);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [selectAdminOpen, setSelectAdminOpen] = useState(false);
  useEffect(() => {
    if (fetcher.data?.selectAdminGroupId) {
      setSelectAdminOpen(true);
    }
  }, [fetcher.data]);
  return <>
    <div>
      <div className="w-full max-w-lg mx-auto flex flex-col items-center lg:mx-0">
        <H1Nav path={'/admin'} title="My Organisations" />
        <TeaserList title={'Invitation Requests'} teasers={invited} />
        <TeaserList title={'Invitation Pending'} teasers={pending} className="mb-8" />
        <div className="flex flex-col gap-4 w-full">
          <H1 className="px-2 mb-1 w-full">Active</H1>
          {
            organisations.length === 0 &&
            <H1 className="text-center text-base">
              You are currently in no organisation
            </H1>
          }
          {
            organisations.map(member => {
              return <ExpandableTeaser key={member.id} avatarPath={member.image} name={member.name}
                team={member.handle}
                games={member.game ? [member.game] : []}
                additionalIcons={mainOrgIcon(member.id, member.is_main_group, theme, user.db.id, fetcher)}>
                <fetcher.Form method="post" action={`/admin/api/group/member`}
                  className="p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto">
                  <input type="hidden" name="intent" value="UPDATE_GROUP" />
                  <input type="hidden" name="userId" value={user.db.id} />
                  <DateInput name="joinedAt" label="Joined at" value={new Date(member.joined_at)} />
                  <div className="w-full flex flex-row space-x-4 justify-center">
                    <ActionButton content="Save" type="submit" name="groupId" value={member.id} />
                    <ActionButton content="Leave" action={() => setDeleteModalOpen(member.id)} />
                  </div>
                </fetcher.Form>
              </ExpandableTeaser>;
            })
          }
        </div>

      </div>
    </div>
    {deleteModal(deleteModalOpen, setDeleteModalOpen, 'Do you want to leave the organisation?', 'LEAVE_GROUP', 'groupId', user.db.id, fetcher)}
    {fetcher.data?.selectAdminGroupId && <SelectNewAdminModal isOpen={selectAdminOpen} handleClose={setSelectAdminOpen}
      groupId={fetcher.data.selectAdminGroupId}
      userId={user.db.id} />}
  </>;
};
