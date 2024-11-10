import type { FetcherWithComponents } from '@remix-run/react';
import { json, useFetcher, useLoaderData, useOutletContext } from '@remix-run/react';
import type { LoaderFunctionArgs, SerializeFrom } from '@remix-run/server-runtime';
import { useState } from 'react';
import { z } from 'zod';
import { zx } from 'zodix';
import ActionButton from '~/components/Button/ActionButton';
import IconButton from '~/components/Button/IconButton';
import RadioButtonGroup from '~/components/Forms/RadioButtonGroup';
import TextInput from '~/components/Forms/TextInput';
import Icons from '~/components/Icons';
import SearchMemberModal from '~/components/Modals/SearchMemberModal';
import Modal from '~/components/Notifications/Modal';
import ExpandableTeaser from '~/components/Teaser/ExpandableTeaser';
import type { ITeaserProps } from '~/components/Teaser/LinkTeaser';
import TeaserList from '~/components/Teaser/TeaserList';
import H1 from '~/components/Titles/H1';
import H1Nav from '~/components/Titles/H1Nav';
import type { loader as handleLoader } from '~/routes/admin+/team/$handle';
import { db } from '~/services/db.server';
import { checkUserAuth } from '~/utils/auth.server';
import { getTeamMemberTeasers } from '~/utils/teaserHelper';
import { AccessRightValue, RequestStatusValue } from '~/models/database.model';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string(),
  });
  const user = await checkUserAuth(request);

  const teamUser = await db.groupMember.findFirstOrThrow({
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
        handle,
      },
    },
    include: {
      user: {
        include: {
          games: {
            where: {
              is_active: true,
            },
          },
        },
      },
    },
  });
  const members = allMembers.filter(mem => mem.request_status === RequestStatusValue.ACCEPTED);
  const invited = allMembers.filter(mem => mem.request_status === RequestStatusValue.PENDING_GROUP);
  const pending = allMembers.filter(mem => mem.request_status === RequestStatusValue.PENDING_USER);

  return json({
    teamUser,
    members: members,
    invited: getTeamMemberTeasers(handle, invited),
    pending: getTeamMemberTeasers(handle, pending),
  });
}

const addInvitationIcons = (teaser: ITeaserProps, groupId: string, fetcher: FetcherWithComponents<any>) => {
  return <fetcher.Form method="post" action={'/admin/api/invitation'} encType="multipart/form-data" className="flex gap-x-2">
    <input type="hidden" name="entityId" value={groupId} />
    <input type="hidden" name="userId" value={teaser.id} />
    <IconButton icon="accept" type="submit" name="action" value="ACCEPT" />
    <IconButton icon="decline" type="submit" name="action" value="DECLINE" />
  </fetcher.Form>;
};

export default function () {
  const { teamUser, members, invited, pending } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const types = Object.keys(AccessRightValue);

  const allowedTypes = types.slice(0, types.indexOf(teamUser.access_rights) + 1);

  return <>
    <div>
      <div className="w-full max-w-lg mx-auto lg:mx-0 space-y-4 flex flex-col items-center">
        <H1Nav path={'..'} title="Members">
          <ActionButton content="Invite" action={() => setInviteModalOpen(true)} className="ml-8 w-1/5" />
        </H1Nav>
        <H1 className="px-4 mb-1 w-full">Members</H1>
        {
          // Update Member
          members.map(member => {
            return <ExpandableTeaser key={member.user.id} avatarPath={member.user.image} name={member.user.handle}
              team={team.handle}
              games={member.user.games}
              expandable={allowedTypes.some(type => type === member.access_rights) && member.user.id !== teamUser.user_id}>
              <fetcher.Form method="put" action={'/admin/api/group/members'}
                className="p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto">
                <input type="hidden" name="groupId" value={team.id} />
                <TextInput id="role" label="Role" defaultValue={member.role} />
                <RadioButtonGroup values={allowedTypes} id={`user-rights`} selected={member.access_rights} />
                <div className="w-full flex flex-row space-x-4 justify-center">
                  <ActionButton content="Save" type="submit" name="userId" value={member.user.id} />
                  <ActionButton content="Kick" action={() => setDeleteModalOpen(member.user.id)} />
                </div>
              </fetcher.Form>
            </ExpandableTeaser>;
          })
        }
        <TeaserList title={'Invitation Requests'} teasers={invited}
          iconFactory={(teaser) => addInvitationIcons(teaser, team.id, fetcher)} />
        <TeaserList title={'Invitation Pending'} teasers={pending} staticIcon={
          <Icons iconName="clock" className="h-8 w-8" />
        } />
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-color">
        Remove User from Team?
      </div>
      <fetcher.Form className="flex justify-between gap-2" method="delete" action={'/admin/api/group/members'}
        onSubmit={() => setDeleteModalOpen(null)}>
        <input type="hidden" name="groupId" value={team.id} />
        {deleteModalOpen && <ActionButton content="Yes" type="submit" name="userId" value={deleteModalOpen} />}
        <ActionButton className="bg-gray-3" content="No" action={() => setDeleteModalOpen(null)} />
      </fetcher.Form>
    </Modal>
    {inviteModalOpen &&
      <SearchMemberModal isOpen={inviteModalOpen} handleClose={setInviteModalOpen} groupId={team.id} />}
  </>;
}
