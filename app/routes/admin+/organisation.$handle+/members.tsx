import type { FetcherWithComponents } from "@remix-run/react";
import { json, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { useState } from "react";
import { z } from "zod";
import { zx } from "zodix";
import ActionButton from "~/components/Button/ActionButton";
import IconButton from "~/components/Button/IconButton";
import RadioButtonGroup from "~/components/Forms/RadioButtonGroup";
import TextInput from "~/components/Forms/TextInput";
import Icons from "~/components/Icons";
import SearchMemberModal from "~/components/Modals/SearchMemberModal";
import Modal from "~/components/Notifications/Modal";
import ExpandableTeaser from "~/components/Teaser/ExpandableTeaser";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import H1 from "~/components/Titles/H1";
import H1Nav from "~/components/Titles/H1Nav";
import type { loader as handleLoader } from "~/routes/admin+/organisation/$handle";
import { db } from "~/services/db.server";
import { checkUserAuth } from "~/utils/auth.server";
import { getOrganisationMemberTeasers } from "~/utils/teaserHelper";
import { AccessRightValue, RequestStatusValue } from '~/models/database.model';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  })
  const user = await checkUserAuth(request);

  const groupUser = await db.groupMember.findFirstOrThrow({
    where: {
      user_id: Number(user.db.id),
      group: {
        handle,
      },
    },
  });

  const allMembers = await db.groupMember.findMany({
    where: {
      group: {
        handle
      }
    },
    include: {
      user: {
        include: {
          games: {
            where: {
              is_active: true,
            },
          },
          groups: { include: { group: true } }
        }
      }
    }
  });
  const members = allMembers.filter(mem => mem.request_status === RequestStatusValue.ACCEPTED);
  const invited = allMembers.filter(mem => mem.request_status === RequestStatusValue.PENDING_GROUP);
  const pending = allMembers.filter(mem => mem.request_status === RequestStatusValue.PENDING_USER);

  return json({
    groupUser,
    members: members,
    invited: getOrganisationMemberTeasers(invited),
    pending: getOrganisationMemberTeasers(pending)
  });
}


const addInvitationIcons = (teaser: ITeaserProps, groupId: string, fetcher: FetcherWithComponents<any>) => {
  return <fetcher.Form method='post' action={'/admin/api/invitation'} encType='multipart/form-data' className="flex space-x-2">
    <input type='hidden' name='entityId' value={groupId} />
    <input type='hidden' name='userId' value={teaser.id} />
    <IconButton icon='accept' type='submit' name='action' value='ACCEPT' />
    <IconButton icon='decline' type='submit' name='action' value='DECLINE' />
  </fetcher.Form>;
};

export default function () {
  const { groupUser, members, invited, pending } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const { organisation } = useOutletContext<SerializeFrom<typeof handleLoader>>()
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const types = Object.keys(AccessRightValue);

  const allowedTypes = types.slice(0, types.indexOf(groupUser.access_rights) + 1);

  return <>
    <div className="w-full max-w-prose mx-auto lg:mx-0 space-y-4 flex flex-col">
      <H1Nav path={'..'} title='Members'>
        <ActionButton content='Invite' action={() => setInviteModalOpen(true)} className='w-1/5 ml-8' />
      </H1Nav>
      <H1 className='px-2 mb-1 w-full'>Members</H1>
      {
        // Update Member
        members.map(member => {
          const isCurrentUser = member.user.id === groupUser.user_id
          return <ExpandableTeaser key={member.user.id} avatarPath={member.user.image} name={member.user.handle}
            team={member.user.groups[0].group.handle}
            games={member.user.games}
            expandable={allowedTypes.some(type => type === member.access_rights)}>
            <fetcher.Form method='put' action={'/admin/api/group/members'} className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
              <input type='hidden' name='groupId' value={organisation.id} />
              <TextInput id='role' label='Role' defaultValue={member.role} />
              {!isCurrentUser &&
                <RadioButtonGroup values={allowedTypes} id={`user-rights`} selected={member.access_rights} />
              }
              {isCurrentUser &&
                <input type="hidden" name={`user-rights`} value={member.access_rights} />
              }
              <div className='w-full flex flex-row space-x-4 justify-center'>
                <ActionButton content='Save' type='submit' name='userId' value={member.user.id} />
                {!isCurrentUser &&
                  <ActionButton content='Kick' action={() => setDeleteModalOpen(member.user.id)} />
                }
              </div>
            </fetcher.Form>
          </ExpandableTeaser>
        })
      }
      <TeaserList title={'Invitation Requests'} teasers={invited}
        iconFactory={(teaser) => addInvitationIcons(teaser, organisation.id, fetcher)} />
      <TeaserList title={'Invitation Pending'} teasers={pending} staticIcon={
        <Icons iconName='clock' className='h-8 w-8' />
      } />
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-color">
        Remove User from Organisation?
      </div>
      <fetcher.Form className='flex justify-between gap-2' method="delete" action={'/admin/api/group/members'} onSubmit={() => setDeleteModalOpen(null)}>
        <input type='hidden' name='groupId' value={organisation.id} />
        {deleteModalOpen && <ActionButton content='Yes' type='submit' name='userId' value={deleteModalOpen} />}
        <ActionButton className='bg-gray-3' content='No' action={() => setDeleteModalOpen(null)} />
      </fetcher.Form>
    </Modal>
    {inviteModalOpen &&
      <SearchMemberModal isOpen={inviteModalOpen} handleClose={setInviteModalOpen} groupId={organisation.id} />}
  </>;
};
