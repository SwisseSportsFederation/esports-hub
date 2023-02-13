import H1Nav from "~/components/Titles/H1Nav";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useFetcher, useLoaderData, useOutletContext, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import ExpandableTeaser from "~/components/Teaser/ExpandableTeaser";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { AccessRight, Game, RequestStatus, User } from "@prisma/client";
import { getTeamMemberTeasers } from "~/utils/teaserHelper";
import ActionButton from "~/components/Button/ActionButton";
import H1 from "~/components/Titles/H1";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import IconButton from "~/components/Button/IconButton";
import type { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as handleLoader } from "~/routes/admin/team/$handle";
import { useCallback, useEffect, useState } from "react";
import TeaserList from "~/components/Teaser/TeaserList";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import TextInput from "~/components/Forms/TextInput";
import RadioButtonGroup from "~/components/Forms/RadioButtonGroup";

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await checkUserAuth(request);
  await checkHandleAccessForEntity(user.db.id, params.handle, 'TEAM', 'MODERATOR');
  const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('UPDATE_USER'),
      'user-rights': z.enum(['MODERATOR', 'MEMBER', 'ADMINISTRATOR']),
      userId: zx.NumAsString,
      teamId: zx.NumAsString,
      role: z.string()
    }),
    z.object({ intent: z.literal('INVITE_USER'), teamId: zx.NumAsString, userId: zx.NumAsString }),
    z.object({ intent: z.literal('KICK_USER'), teamId: zx.NumAsString, userId: zx.NumAsString })
  ]));

  switch(data.intent) {
    case "INVITE_USER": {
      const { teamId, userId } = data;
      try {
        await db.teamMember.create({
          data: {
            joined_at: new Date(),
            access_rights: AccessRight.MEMBER,
            user_id: userId,
            team_id: teamId,
            request_status: RequestStatus.PENDING_USER,
            role: '',
            is_main_team: false
          }
        });
      } catch(error) {
        console.log(error);
        throw json({});
      }
      return json({});
    }
    case "KICK_USER": {
      const { teamId, userId } = data;
      if(userId === Number(user.db.id)) {
        throw json({}, 403);
      }
      await db.teamMember.delete({
        where: {
          user_id_team_id: {
            user_id: userId,
            team_id: teamId
          }
        }
      });
      return json({});
    }
    case "UPDATE_USER": {
      const { role, 'user-rights': userRights, teamId, userId } = data;
      if(userId === Number(user.db.id)) {
        throw json({}, 403);
      }

      await db.teamMember.update({
        where: {
          user_id_team_id: {
            user_id: userId,
            team_id: teamId
          }
        },
        data: {
          role,
          access_rights: userRights,
        }
      });
      return json({});
    }
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = await zx.parseParams(params, {
    handle: z.string()
  })
  const user = await checkUserAuth(request);

  const teamUser = await db.teamMember.findFirstOrThrow({
    where: {
      user_id: Number(user.db.id),
      team: {
        handle
      }
    }
  });

  const allMembers = await db.teamMember.findMany({
    where: {
      team: {
        handle
      }
    },
    include: { user: { include: { games: true } } }
  });
  const members = allMembers.filter(mem => mem.request_status === RequestStatus.ACCEPTED);
  const invited = allMembers.filter(mem => mem.request_status === RequestStatus.PENDING_TEAM);
  const pending = allMembers.filter(mem => mem.request_status === RequestStatus.PENDING_USER);

  return json({
    teamUser,
    members: members,
    invited: getTeamMemberTeasers(handle, invited),
    pending: getTeamMemberTeasers(handle, pending)
  });
}

const SearchModal = ({
                       isOpen,
                       handleClose,
                       teamId
                     }: { isOpen: boolean, handleClose: (value: boolean) => void, teamId: string }) => {
  const fetcher = useFetcher();
  const transition = useTransition();
  const manualSearch = useCallback(() => {
    fetcher.submit({ notInTeam: teamId, search: '' }, { method: 'post', action: '/admin/api/users' });
  }, []);
  console.log(transition);
  useEffect(() => {
    manualSearch()
  }, [manualSearch]);

  useEffect(() => {
    if(transition.state === 'loading') {
      manualSearch();
    }
  }, [manualSearch, transition])
  const addInviteIcons = (teaser: ITeaserProps) => <Form method='post'>
    <input type='hidden' name='teamId' value={teamId}/>
    <input type='hidden' name='userId' value={teaser.id}/>
    <input type='hidden' name='intent' value='INVITE_USER'/>
    <IconButton icon='add' type='submit'/>
  </Form>;
  const convert = (users: (User & { games: Game[] })[]): Omit<ITeaserProps, 'icons'>[] => {
    return users.map(user => ({
      id: String(user.id),
      team: '',
      name: user.handle,
      type: 'USER',
      handle: user.handle,
      games: user.games,
      avatarPath: user.image
    }));
  };
  // @ts-ignore
  const searchTeaser = convert(fetcher.data?.users ?? []);
  return <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
    <fetcher.Form method="post" autoComplete={"on"} className='sticky top-0 z-50' action={'/admin/api/users'}>
      <input type='hidden' name='notInTeam' value={teamId}/>
      <div className="max-w-sm md:max-w-lg">
        <TextInput id="search" label="Search" searchIcon={true}
                   buttonType="submit" defaultValue={""}/>
      </div>
    </fetcher.Form>
    <div className='max-h-[70vh]'>
      <TeaserList title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-white'
                  iconFactory={addInviteIcons}/>
    </div>
    {searchTeaser.length === 0 &&
      <div className='w-full h-40 flex flex-col justify-center items-center'>
        <Icons iconName='search' className='w-20 h-20 fill-white'/>
        <H1 className='text-white'>No results</H1>
      </div>
    }
  </Modal>

}

const addInvitationIcons = (teaser: ITeaserProps, teamId: string, fetcher: FetcherWithComponents<any>) => {
  return <fetcher.Form method='post' action={'/admin/api/team/invitation'} encType='multipart/form-data'>
    <input type='hidden' name='entityId' value={teamId}/>
    <input type='hidden' name='userId' value={teaser.id}/>
    <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
    <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
  </fetcher.Form>;
};

export default function() {
  const { teamUser, members, invited, pending } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>()
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const types = Object.keys(AccessRight);

  const allowedTypes = types.slice(0, types.indexOf(teamUser.access_rights) + 1);

  return <>
    <div className="mx-3">
      <div className="w-full max-w-lg mx-auto space-y-4 flex flex-col items-center">
        <H1Nav path={'..'} title='Members'>
          <ActionButton content='Invite' action={() => setInviteModalOpen(true)} className='w-1/5'/>
        </H1Nav>
        <H1 className='px-4 mb-1 w-full'>Members</H1>
        {
          members.map(member => {
            return <ExpandableTeaser key={member.user.id} avatarPath={member.user.image} name={member.user.handle}
                                     team={team.handle}
                                     games={member.user.games}
                                     expandable={allowedTypes.some(type => type === member.access_rights) && member.user.id !== teamUser.user_id}>
              <Form method='post' className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                <input type='hidden' name='intent' value='UPDATE_USER'/>
                <input type='hidden' name='teamId' value={team.id}/>
                <TextInput id='role' label='Role' defaultValue={member.role}/>
                <RadioButtonGroup values={allowedTypes} id={`user-rights`} selected={member.access_rights}/>
                <div className='w-full flex flex-row space-x-4 justify-center'>
                  <ActionButton content='Save' type='submit' name='userId' value={member.user.id}/>
                  <ActionButton content='Kick' action={() => setDeleteModalOpen(member.user.id)}/>
                </div>
              </Form>
            </ExpandableTeaser>
          })
        }
        <TeaserList title={'Invitation Requests'} teasers={invited}
                    iconFactory={(teaser) => addInvitationIcons(teaser, team.id, fetcher)}/>
        <TeaserList title={'Invitation Pending'} teasers={pending} staticIcon={
          <Icons iconName='clock' className='h-8 w-8'/>
        }/>
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-white">
        Remove User from Team?
      </div>
      <Form className='flex justify-between gap-2' method="post" onSubmit={() => setDeleteModalOpen(null)}>
        <input type='hidden' name='intent' value='KICK_USER'/>
        <input type='hidden' name='teamId' value={team.id}/>
        {deleteModalOpen && <ActionButton content='Yes' type='submit' name='userId' value={deleteModalOpen}/>}
        <ActionButton className='bg-gray-3' content='No' action={() => setDeleteModalOpen(null)}/>
      </Form>
    </Modal>
    {inviteModalOpen &&
      <SearchModal isOpen={inviteModalOpen} handleClose={setInviteModalOpen} teamId={team.id}/>}
  </>;
};
