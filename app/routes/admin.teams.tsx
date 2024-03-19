import { json } from "@vercel/remix";
import type { FetcherWithComponents } from "@remix-run/react";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import type { LoaderFunctionArgs } from '@vercel/remix';
import type { SerializeFrom } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import ActionButton from "~/components/Button/ActionButton";
import IconButton from "~/components/Button/IconButton";
import DateInput from "~/components/Forms/DateInput";
import TextInput from "~/components/Forms/TextInput";
import Icons from "~/components/Icons";
import SelectNewAdminModal from "~/components/Modals/SelectNewAdminModal";
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
import dateInputStyles from "~/styles/date-input.css?url";
import { checkUserAuth } from "~/utils/auth.server";
import { EntityTypeValue, RequestStatusValue } from '~/models/database.model';

export function links() {
  return [
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

const getInvitationTeaser = (invitations: SerializeFrom<Membership>[], userId: string, pending: boolean, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.map(invitation => {
    let icons = <fetcher.Form method='post' action={`/admin/api/invitation`} className="flex space-x-2">
      <input type='hidden' name='entityId' value={`${invitation.id}`}/>
      <input type='hidden' name='userId' value={userId}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;

    if(pending) {
      icons = <Icons iconName='clock' className='h-8 w-8'/>;
    }

    return {
      type: EntityTypeValue.TEAM,
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

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const formerTeams = await db.formerTeam.findMany({
    where: {
      user_id: Number(user.db.id)
    },
    orderBy: {
      from: 'desc'
    }
  });
  return json({
    formerTeams
  });
}

const deleteModal = (isOpen: StringOrNull, activeFunction: Function, text: string, intent: string, submitName: string, userId: string, fetcher: FetcherWithComponents<any>) =>
  <Modal isOpen={!!isOpen} handleClose={() => activeFunction(null)}>
    <div className="flex justify-center text-center text-2xl mb-8 text-color">
      {text}
    </div>
    <fetcher.Form method='post' action={`/admin/api/groupMember`} className='flex justify-between gap-2' onSubmit={() => activeFunction(null)}>
      <input type='hidden' name='intent' value={intent}/>
      <input type='hidden' name='userId' value={userId}/>
      {isOpen && <ActionButton content='Yes' type='submit' name={submitName} value={isOpen}/>}
      <ActionButton className='bg-gray-3' content='No' action={() => activeFunction(null)}/>
    </fetcher.Form>
  </Modal>;

const mainTeamIcon = (groupId: string, isMainTeam: boolean | null, userId: string, fetcher: FetcherWithComponents<any>) =>
  <fetcher.Form method='post' action={`/admin/api/groupMember`} className={isMainTeam ? 'text-yellow-400' : 'text-gray-3'}>
    <input type='hidden' name='intent' value='CHANGE_MAIN_GROUP'/>
    <input type='hidden' name='userId' value={userId}/>
    <IconButton icon='star' type='submit' name='groupId' value={groupId} className="rounded-none mx-1"/>
  </fetcher.Form>;

const formerTeamModal = (isOpen: boolean, handleClose: (value: boolean) => void, userId: string, fetcher: FetcherWithComponents<any>) =>
  <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
    <H1 className='text-2xl text-color'>Add new Former Team</H1>
    <fetcher.Form method='post' action={`/admin/api/groupMember`} id="createFormerTeamForm" onSubmit={() => handleClose(false)}
          className='flex items-center flex-col space-y-6 w-full max-w-xl mx-auto'>
      <input type='hidden' name='intent' value='CREATE_FORMER_TEAM'/>
      <input type='hidden' name='userId' value={userId}/>
      <TextInput id='name' label='Team name' defaultValue={""}/>
      <DateInput name='from' label='From' value={new Date()}/>
      <DateInput name='to' label='To' value={new Date()}/>
      <div className='w-full flex flex-row space-x-4 justify-center'>
        <ActionButton content='Create' type='submit'/>
        <ActionButton content='Cancel' action={() => handleClose(false)}/>
      </div>
    </fetcher.Form>
  </Modal>;

export default function() {
  const { formerTeams } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { user, memberships } = useOutletContext<SerializeFrom<typeof adminLoader>>()
  const teams = memberships.groups.filter(group => group.group_type === EntityTypeValue.TEAM);

  const invitedTeams = memberships.groupInvitations.filter(e => e.request_status === RequestStatusValue.PENDING_USER && e.group_type === "TEAM")
  const pendingTeams = memberships.groupInvitations.filter(e => e.request_status === RequestStatusValue.PENDING_GROUP && e.group_type === "TEAM")

  const invited = getInvitationTeaser(invitedTeams, user.db.id, false, fetcher);
  const pending = getInvitationTeaser(pendingTeams, user.db.id, true, fetcher);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [deleteFormerModalOpen, setDeleteFormerModalOpen] = useState<string | null>(null);
  const [formerTeamCreateOpen, setFormerTeamCreateOpen] = useState(false);
  const [selectAdminOpen, setSelectAdminOpen] = useState(false);
  useEffect(() => {
    if(fetcher.data?.selectAdminGroupId) {
      setSelectAdminOpen(true)
    }
  }, [fetcher.data]);
  return <>
    <div className="mx-3">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <H1Nav path={'/admin'} title='My Teams'/>
        <TeaserList title={'Invitation Requests'} teasers={invited}/>
        <TeaserList title={'Invitation Pending'} teasers={pending}/>
        <div className='flex flex-col gap-4 w-full mt-8'>
          <H1 className='px-2 mb-1 w-full'>Active</H1>
          {
            teams.length === 0 &&
            <H1 className='text-center text-base'>
              You are currently in no team
            </H1>
          }
          {
            teams
              .map(member => {
                return <ExpandableTeaser key={member.id} avatarPath={member.image} name={member.name}
                                         team={member.handle}
                                         games={member.game ? [member.game] : []}
                                         additionalIcons={mainTeamIcon(member.id, member.is_main_group, user.db.id, fetcher)}>
                  <fetcher.Form method='post' action={`/admin/api/groupMember`} className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                    <input type='hidden' name='intent' value='UPDATE_GROUP'/>
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

        <div className='flex flex-col gap-4 w-full mt-8'>
          <H1 className='px-2 mb-1 w-full flex items-center justify-between mt-8'>
            Former Teams <ActionButton content='Add' action={() => setFormerTeamCreateOpen(true)} className='w-1/5'/>
          </H1>
          {
            formerTeams.map(formerTeam => {
              return <ExpandableTeaser key={formerTeam.id} avatarPath={null} name={formerTeam.name}
                                       team={""}
                                       games={[]}>
                <fetcher.Form method='post' action={`/admin/api/groupMember`} className='p-5 flex items-center flex-col space-y-6 w-full max-w-xl mx-auto'>
                  <input type='hidden' name='intent' value='UPDATE_FORMER_TEAM'/>
                  <input type='hidden' name='userId' value={user.db.id}/>
                  <TextInput id='name' label='Team name' defaultValue={formerTeam.name}/>
                  <DateInput name='from' label='From' value={new Date(formerTeam.from || "")}/>
                  <DateInput name='to' label='To' value={new Date(formerTeam.to || "")}/>
                  <div className='w-full flex flex-row space-x-4 justify-center'>
                    <ActionButton content='Save' type='submit' name='formerTeamName' value={formerTeam.name}/>
                    <ActionButton content='Remove' action={() => setDeleteFormerModalOpen(formerTeam.name)}/>
                  </div>
                </fetcher.Form>
              </ExpandableTeaser>
            })
          }
        </div>
      </div>
    </div>
    {deleteModal(deleteModalOpen, setDeleteModalOpen, 'Do you want to leave the team?', 'LEAVE_GROUP', 'groupId', user.db.id, fetcher)}
    {deleteModal(deleteFormerModalOpen, setDeleteFormerModalOpen, 'Do you want to delete the former team?', 'LEAVE_FORMER_TEAM', 'formerTeamName', user.db.id, fetcher)}
    {formerTeamModal(formerTeamCreateOpen, setFormerTeamCreateOpen, user.db.id, fetcher)}
    {fetcher.data?.selectAdminGroupId && <SelectNewAdminModal isOpen={selectAdminOpen} handleClose={setSelectAdminOpen}
                                                           groupId={fetcher.data?.selectAdminGroupId} userId={user.db.id}/>}
  </>;
};
