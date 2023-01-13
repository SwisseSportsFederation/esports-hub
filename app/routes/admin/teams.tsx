import H1Nav from "~/components/Titles/H1Nav";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useActionData, useFetcher, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import ExpandableTeaser from "~/components/Teaser/ExpandableTeaser";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { ActionFunctionArgs } from "@remix-run/router";
import type { Game, Prisma, User } from "@prisma/client";
import { AccessRight, RequestStatus } from "@prisma/client";
import ActionButton from "~/components/Button/ActionButton";
import H1 from "~/components/Titles/H1";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import IconButton from "~/components/Button/IconButton";
import type { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin";
import { useState } from "react";
import TeaserList from "~/components/Teaser/TeaserList";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import TextInput from "~/components/Forms/TextInput";
import DateInput from "~/components/Forms/DateInput";
import { Invitation } from "~/services/admin/index.server";
import { entityToPathSegment } from "~/helpers/entityType";

// TODO make correct actions
export async function action({ request, params }: ActionFunctionArgs) {
  const user = await checkUserAuth(request);
  await checkHandleAccessForEntity(user, params.handle, 'TEAM', 'MODERATOR');
  const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('UPDATE_USER'),
      'user-rights': z.enum(['MODERATOR', 'MEMBER', 'ADMINISTRATOR']),
      userId: zx.NumAsString,
      teamId: zx.NumAsString,
      role: z.string()
    }),
    z.object({ intent: z.literal('INVITE_USER'), teamId: zx.NumAsString, userId: zx.NumAsString }),
    z.object({ intent: z.literal('SEARCH'), search: z.string() }),
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
      return json({ searchResult: [] });
    }
    case "SEARCH": {
      const { search } = data;
      const query = (): Prisma.StringFilter => ({
        contains: search,
        mode: 'insensitive'
      });
      try {
        const users = await db.user.findMany({
          where: {
            OR: [
              { name: query() },
              { surname: query() },
              { handle: query() }
            ]
          },
          include: { games: true }
        });
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
        return json({ searchResult: convert(users) });
      } catch(error) {
        console.log(error);
        throw json({}, 500);
      }

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
      return json({ searchResult: [] });
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
      return json({ searchResult: [] });
    }
  }
}

const getInvitationTeaser = (invitations: Invitation[], userId: string, pending: boolean, fetcher: FetcherWithComponents<any>): ITeaserProps[] => {
  return invitations.map(invitation => {
    const path = entityToPathSegment(invitation.type)
    let icons = <fetcher.Form method='post' action={`/admin/api/${path}/invitation`} className="flex space-x-2">
    <input type='hidden' name='entityId' value={`${invitation.id}`}/>
    <input type='hidden' name='userId' value={userId}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;
    if(pending) {
      icons = <Icons iconName='clock' className='h-8 w-8'/>;
    }

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
  const actionData = useActionData<typeof action>();

  const fetcher = useFetcher();
  const { user, memberships } = useOutletContext<SerializeFrom<typeof adminLoader>>()
  const members = memberships.teams;
  const invited = getInvitationTeaser(memberships.invitations.filter(e => e.request_status === RequestStatus.PENDING_USER), user.db.id, false, fetcher);
  const pending = getInvitationTeaser(memberships.invitations.filter(e => e.request_status === RequestStatus.PENDING_TEAM), user.db.id, true, fetcher);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const searchTeaser = (actionData?.searchResult ?? [])
    .filter(team => ![...pending, ...invited].some(t => t.id === team.id))
    .filter(team => !members.some(mem => mem.team_id === team.id));

  const addSearchIcons = (teaser: ITeaserProps) => {
    return <Form method='post' onSubmit={() => setInviteModalOpen(false)}>
      <input type='hidden' name='teamId' value={teaser.id}/>
      <input type='hidden' name='userId' value={user.db.id}/>
      <input type='hidden' name='intent' value='INVITE_TEAM'/>
      <IconButton icon='add' type='submit'/>
    </Form>
  }

  // TODO load former teams and add them

  return <>
    <div className="mx-3">
      <div className="w-full max-w-lg mx-auto space-y-4 flex flex-col items-center">
        <H1Nav path={'..'} title='My Teams'>
          <ActionButton content='Invite' action={() => setInviteModalOpen(true)} className='w-1/5'/>
        </H1Nav>
        <TeaserList title={'Invitation Requests'} teasers={invited}/>
        <TeaserList title={'Invitation Pending'} teasers={pending}/>
        <H1 className='px-2 mb-1 w-full'>Active</H1>
        {
          members.map(member => {
            return <ExpandableTeaser key={member.team.id} avatarPath={member.team.image} name={member.team.name}
                                     team={member.team.handle}
                                     games={member.team.game}>
              <Form method='post' className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                <input type='hidden' name='intent' value='UPDATE_TEAM'/>
                <input type='hidden' name='userId' value={user.db.id}/>
                <DateInput name='joinedAt' label='Joined at' value={new Date(member.joined_at)}/>
                <div className='w-full flex flex-row space-x-4 justify-center'>
                  <ActionButton content='Save' type='submit' name='teamId' value={member.team.id}/>
                  <ActionButton content='Remove' action={() => setDeleteModalOpen(member.team.id)}/>
                </div>
              </Form>
            </ExpandableTeaser>
          })
        }
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-white">
        Remove User from Team?
      </div>
      <Form className='flex justify-between gap-2' method="post" onSubmit={() => setDeleteModalOpen(null)}>
        <input type='hidden' name='intent' value='KICK_USER'/>
        <input type='hidden' name='userId' value={user.db.id}/>
        {deleteModalOpen && <ActionButton content='Yes' type='submit' name='teamId' value={deleteModalOpen}/>}
        <ActionButton className='bg-gray-3' content='No' action={() => setDeleteModalOpen(null)}/>
      </Form>
    </Modal>

    <Modal isOpen={inviteModalOpen} handleClose={() => setInviteModalOpen(false)}>
      <Form method="post" autoComplete={"on"} className='sticky top-0 z-50'>
        <input type='hidden' name='intent' value='SEARCH'/>
        <div className="max-w-sm md:max-w-lg">
          <TextInput id="search" label="Search" searchIcon={true}
                     buttonType="submit" defaultValue={""}/>
        </div>
      </Form>
      <TeaserList title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-white'
                  iconFactory={addSearchIcons}/>
      {searchTeaser.length === 0 &&
        <div className='w-full h-40 flex flex-col justify-center items-center'>
          <Icons iconName='search' className='w-20 h-20 fill-white'/>
          <H1 className='text-white'>No results</H1>
        </div>
      }
    </Modal>
  </>;
};