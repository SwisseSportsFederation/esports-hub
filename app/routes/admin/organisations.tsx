import { AccessRight, RequestStatus } from "@prisma/client";
import { json } from "@remix-run/node";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useActionData, useFetcher, useOutletContext } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/router";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zx } from "zodix";
import ActionButton from "~/components/Button/ActionButton";
import IconButton from "~/components/Button/IconButton";
import DateInput from "~/components/Forms/DateInput";
import TextInput from "~/components/Forms/TextInput";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import ExpandableTeaser from "~/components/Teaser/ExpandableTeaser";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import H1 from "~/components/Titles/H1";
import H1Nav from "~/components/Titles/H1Nav";
import type { StringOrNull } from "~/db/queries.server";
import type { loader as adminLoader } from "~/routes/admin";
import type { Membership } from "~/services/admin/index.server";
import { db } from "~/services/db.server";
import dateInputStyles from "~/styles/date-input.css";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

// TODO: Check if API Works

export function links() {
  return [
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

const getInvitationTeaser = (invitations: SerializeFrom<Membership>[], userId: string, pending: boolean, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.map(invitation => {
    let icons = <fetcher.Form method='post' action={`/admin/api/organisation/invitation`} className="flex space-x-2">
      <input type='hidden' name='entityId' value={`${invitation.id}`}/>
      <input type='hidden' name='userId' value={userId}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;

    if(pending) {
      icons = <Icons iconName='clock' className='h-8 w-8'/>;
    }

    return {
      type: 'ORG',
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

const deleteModal = (isOpen: StringOrNull, activeFunction: Function, text: string, intent: string, submitName: string, userId: string, fetcher: FetcherWithComponents<any>) =>
  <Modal isOpen={!!isOpen} handleClose={() => activeFunction(null)}>
    <div className="flex justify-center text-center text-2xl mb-8 text-white">
      {text}
    </div>
    {/** TODO: Check if onSubmit() activeFunction still is being done (closing the modal) */}
    <fetcher.Form method='post' action={`/admin/api/groupMember`} className='flex justify-between gap-2' onSubmit={() => activeFunction(null)}>
      <input type='hidden' name='intent' value={intent}/>
      <input type='hidden' name='userId' value={userId}/>
      {isOpen && <ActionButton content='Yes' type='submit' name={submitName} value={isOpen}/>}
      <ActionButton className='bg-gray-3' content='No' action={() => activeFunction(null)}/>
    </fetcher.Form>
  </Modal>;

const mainOrgIcon = (groupId: string, isMainOrg: boolean | null, userId: string, fetcher: FetcherWithComponents<any>) =>
  <fetcher.Form method='post' action={`/admin/api/groupMember`} className={isMainOrg ? 'text-yellow-400' : 'text-gray-3'}>
    <input type='hidden' name='intent' value='CHANGE_MAIN_ORGANISATION'/>
    <input type='hidden' name='userId' value={userId}/>
    <IconButton icon='star' type='submit' name='groupId' value={groupId} className="rounded-none mx-1"/>
  </fetcher.Form>;

const SelectNewAdminModal = (
  { isOpen, handleClose, groupId, userId }:
    { isOpen: boolean, handleClose: (value: boolean) => void, groupId: string, userId: string }) => {
  const fetcher = useFetcher();
  useEffect(() => {
    fetcher.submit({ groupId, search: '' }, { method: 'post', action: '/admin/api/organisation/members' })
  }, [groupId]);
  // @ts-ignore
  const searchTeaser = (fetcher.data?.members ?? []).map(member => ({ ...member, ...member.user })).filter(member => member.user_id !== userId);

  const addAsAdminIcon = (teaser: ITeaserProps) => {
    return <fetcher.Form method='post' action={`/admin/api/groupMember`} onSubmit={() => handleClose(false)}>
      <input type='hidden' name='groupId' value={groupId}/>
      <input type='hidden' name='newAdminUserId' value={teaser.id}/>
      <input type='hidden' name='userId' value={userId}/>
      <input type='hidden' name='intent' value='PROMOTE_USER'/>
      <IconButton icon='accept' type='submit'/>
    </fetcher.Form>
  }
  return <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
    <H1 className='text-2xl text-white'>Select new Administrator</H1>
    <fetcher.Form method="post" autoComplete={"on"} className='sticky top-0 z-50' action={'/admin/api/organisation/members'}>
      <input type='hidden' name='groupId' value={groupId}/>
      <div className="max-w-sm md:max-w-lg">
        <TextInput id="search" label="Search" searchIcon={true}
                   buttonType="submit" defaultValue={""}/>
      </div>
    </fetcher.Form>
    <TeaserList type='Static' title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-white'
                iconFactory={addAsAdminIcon}/>
    {(!fetcher.data || fetcher.data?.members.length === 0) &&
      <div className='w-full h-40 flex flex-col justify-center items-center'>
        <Icons iconName='search' className='w-20 h-20 fill-white'/>
        <H1 className='text-white'>No results</H1>
      </div>
    }
  </Modal>
};

export default function() {
  const actionData = useActionData<{ selectAdminOrgId: StringOrNull }>();
  const fetcher = useFetcher();
  const { user, memberships } = useOutletContext<SerializeFrom<typeof adminLoader>>()

  const invitedOrganisations = memberships.orgInvitations.filter(e => e.request_status === RequestStatus.PENDING_USER)
  const pendingOrganisations = memberships.orgInvitations.filter(e => e.request_status === RequestStatus.PENDING_ORG)

  const invited = getInvitationTeaser(invitedOrganisations, user.db.id, false, fetcher);
  const pending = getInvitationTeaser(pendingOrganisations, user.db.id, true, fetcher);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [selectAdminOpen, setSelectAdminOpen] = useState(false);
  useEffect(() => {
    if(actionData?.selectAdminOrgId) {
      setSelectAdminOpen(true)
    }
  }, [actionData]);
  return <>
    <div className="mx-3">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <H1Nav path={'/admin'} title='My Organisations'/>
        <TeaserList title={'Invitation Requests'} teasers={invited}/>
        <TeaserList title={'Invitation Pending'} teasers={pending}/>
        <div className='flex flex-col gap-4 w-full mt-8'>
          <H1 className='px-2 mb-1 w-full'>Active</H1>
          {
            memberships.orgs.length === 0 &&
            <H1 className='text-center text-base'>
              You are currently in no organisation
            </H1>
          }
          {
            memberships.orgs
              .map(member => {
                return <ExpandableTeaser key={member.id} avatarPath={member.image} name={member.name}
                                         team={member.handle}
                                         games={member.game ? [member.game] : []}
                                         additionalIcons={mainOrgIcon(member.id, member.is_main_team, user.db.id, fetcher)}>
                  <fetcher.Form method='post' action={`/admin/api/groupMember`} className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                    <input type='hidden' name='intent' value='UPDATE_ORGANISATION'/>
                    <input type='hidden' name='userId' value={user.db.id}/>
                    <DateInput name='joinedAt' label='Joined at' value={new Date(member.joined_at)}/>
                    <div className='w-full flex flex-row space-x-4 justify-center'>
                      <ActionButton content='Save' type='submit' name='groupId' value={member.id}/>
                      <ActionButton content='Leave' action={() => setDeleteModalOpen(member.id)}/>
                    </div>
                  </fetcher.Form>
                </ExpandableTeaser>
              })
          }
        </div>

      </div>
    </div>
    {deleteModal(deleteModalOpen, setDeleteModalOpen, 'Do you want to leave the organisation?', 'LEAVE_ORGANISATION', 'groupId', user.db.id, fetcher)}
    {actionData?.selectAdminOrgId && <SelectNewAdminModal isOpen={selectAdminOpen} handleClose={setSelectAdminOpen}
                                                           groupId={actionData?.selectAdminOrgId} userId={user.db.id}/>}
  </>;
};
