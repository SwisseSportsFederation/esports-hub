import { AccessRight, RequestStatus } from "@prisma/client";
import { json } from "@remix-run/node";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useActionData, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
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

export function links() {
  return [
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

// TODO: remove API functions here and call /api/groupMember

const promoteUser = async (userId: number, newAdminUserId: string, teamId: number) => {
  await checkIdAccessForEntity(userId.toString(), teamId, 'MEMBER');
  await checkIdAccessForEntity(newAdminUserId, teamId, 'MEMBER');

  await db.groupMember.update({
    where: {
      user_id_group_id: {
        user_id: Number(newAdminUserId),
        group_id: teamId
      }
    },
    data: {
      access_rights: AccessRight.ADMINISTRATOR
    }
  });
  // potentially send email
}
const leaveTeam = async (userId: number, teamId: number) => {
  await checkIdAccessForEntity(userId.toString(), teamId, 'MEMBER');

  const team = await db.group.findFirst({
    where: {
      id: teamId
    },
    include: {
      members: true
    }
  });
  // Set Team inactive if there is no more members
  if(team?.members.length === 1) {
    await db.group.update({
      where: {
        id: teamId
      },
      data: {
        is_active: false
      }
    });
  } else {
    // Set new admin if member is last admin
    const admins = team?.members.filter(m => m.request_status === RequestStatus.ACCEPTED && m.access_rights === AccessRight.ADMINISTRATOR);
    if(admins?.length === 1 && admins[0].user_id === BigInt(userId)) {
      return json({ selectAdminTeamId: teamId })
    }
  }
  // delete member from team
  const teamMember = await db.groupMember.delete({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: teamId
      }
    }
  });
  if(team) {
    await db.formerTeam.create({
      data: {
        user_id: userId,
        name: team.name,
        from: teamMember.joined_at,
        to: new Date(),
      }
    });
  }
  return json({});
}

const updateTeam = async (userId: number, teamId: number, joinedAt: string) => {
  await checkIdAccessForEntity(userId.toString(), teamId, 'MEMBER');
  await db.groupMember.update({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: teamId
      }
    },
    data: {
      ...(joinedAt && ({ joined_at: new Date(joinedAt) })),
    }
  });
  return json({});
}

const changeMainTeam = async (userId: number, teamId: number) => {
  await checkIdAccessForEntity(userId.toString(), teamId, 'MEMBER');
  await db.groupMember.updateMany({
    where: {
      user_id: userId
    },
    data: {
      is_main_group: false
    }
  });
  await db.groupMember.update({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: teamId
      }
    },
    data: {
      is_main_group: true
    }
  });
  return json({});
}

const updateFormerTeam = async (userId: number, name: string, from: string, to: string, formerTeamName: string) => {
  await db.formerTeam.update({
    where: {
      user_id_name: {
        user_id: userId,
        name: formerTeamName
      }
    },
    data: {
      name,
      from: new Date(from),
      to: new Date(to)
    }
  });
  return json({});
}

const createFormerTeam = async (userId: number, name: string, from: string, to: string) => {
  await db.formerTeam.create({
    data: {
      user_id: userId,
      name,
      from: new Date(from),
      to: new Date(to)
    }
  });
  return json({});
}


const leaveFormerTeam = async (userId: number, formerTeamName: string) => {
  await db.formerTeam.delete({
    where: {
      user_id_name: {
        user_id: userId,
        name: formerTeamName
      }
    }
  });
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await checkUserAuth(request);
  const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('UPDATE_TEAM'),
      userId: zx.NumAsString,
      teamId: zx.NumAsString,
      joinedAt: z.string()
    }),
    z.object({
      intent: z.literal('PROMOTE_USER'), teamId: zx.NumAsString, userId: zx.NumAsString, newAdminUserId: z.string()
    }),
    z.object({ intent: z.literal('LEAVE_TEAM'), teamId: zx.NumAsString, userId: zx.NumAsString }),
    z.object({
      intent: z.literal('CHANGE_MAIN_TEAM'),
      userId: zx.NumAsString,
      teamId: zx.NumAsString
    }),
    z.object({
      intent: z.literal('UPDATE_FORMER_TEAM'),
      userId: zx.NumAsString,
      formerTeamName: z.string(),
      from: z.string(),
      to: z.string(),
      name: z.string()
    }),
    z.object({
      intent: z.literal('CREATE_FORMER_TEAM'),
      userId: zx.NumAsString,
      from: z.string(),
      to: z.string(),
      name: z.string()
    }),
    z.object({
      intent: z.literal('LEAVE_FORMER_TEAM'),
      userId: zx.NumAsString,
      formerTeamName: z.string(),
    }),
  ]));

  const { userId } = data;
  if(userId !== Number(user.db.id)) {
    throw json({}, 403);
  }

  switch(data.intent) {
    case "PROMOTE_USER": {
      const { newAdminUserId, teamId } = data;
      promoteUser(userId, newAdminUserId, teamId);
      // purpose fallthrough
    }
    case "LEAVE_TEAM": {
      const { teamId } = data;
      return leaveTeam(userId, teamId);
    }
    case "UPDATE_TEAM": {
      const { joinedAt, teamId } = data;
      return updateTeam(userId, teamId, joinedAt);
    }
    case "CHANGE_MAIN_TEAM": {
      const { teamId } = data;
      return changeMainTeam(userId, teamId);
    }
    case "UPDATE_FORMER_TEAM": {
      const { name, from, to, formerTeamName } = data;
      return updateFormerTeam(userId, name, from, to, formerTeamName);
    }
    case "CREATE_FORMER_TEAM": {
      const { name, from, to } = data;
      return createFormerTeam(userId, name, from, to);
    }
    case "LEAVE_FORMER_TEAM": {
      const { formerTeamName } = data;
      return leaveFormerTeam(userId, formerTeamName);
    }
  }
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
      type: 'TEAM',
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

const deleteModal = (isOpen: StringOrNull, activeFunction: Function, text: string, intent: string, submitName: string, userId: string) =>
  <Modal isOpen={!!isOpen} handleClose={() => activeFunction(null)}>
    <div className="flex justify-center text-center text-2xl mb-8 text-color">
      {text}
    </div>
    <Form className='flex justify-between gap-2' method="post" onSubmit={() => activeFunction(null)}>
      <input type='hidden' name='intent' value={intent}/>
      <input type='hidden' name='userId' value={userId}/>
      {isOpen && <ActionButton content='Yes' type='submit' name={submitName} value={isOpen}/>}
      <ActionButton className='bg-gray-3' content='No' action={() => activeFunction(null)}/>
    </Form>
  </Modal>;

const mainTeamIcon = (teamId: string, isMainTeam: boolean | null, userId: string) =>
  <Form method='post' className={isMainTeam ? 'text-yellow-400' : 'text-gray-3'}>
    <input type='hidden' name='intent' value='CHANGE_MAIN_TEAM'/>
    <input type='hidden' name='userId' value={userId}/>
    <IconButton icon='star' type='submit' name='teamId' value={teamId} className="rounded-none mx-1"/>
  </Form>;

const formerTeamModal = (isOpen: boolean, handleClose: (value: boolean) => void, userId: string) =>
  <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
    <H1 className='text-2xl text-color'>Add new Former Team</H1>
    <Form id="createFormerTeamForm" method='post' onSubmit={() => handleClose(false)}
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
    </Form>
  </Modal>;

const SelectNewAdminModal = (
  { isOpen, handleClose, teamId, userId }:
    { isOpen: boolean, handleClose: (value: boolean) => void, teamId: string, userId: string }) => {
  const fetcher = useFetcher();
  useEffect(() => {
    fetcher.submit({ teamId, search: '' }, { method: 'post', action: '/admin/api/group/members' })
  }, [teamId]);
  // @ts-ignore
  const searchTeaser = (fetcher.data?.members ?? []).map(member => ({ ...member, ...member.user })).filter(member => member.user_id !== userId);

  const addAsAdminIcon = (teaser: ITeaserProps) => {
    return <Form method='post' onSubmit={() => handleClose(false)}>
      <input type='hidden' name='teamId' value={teamId}/>
      <input type='hidden' name='newAdminUserId' value={teaser.id}/>
      <input type='hidden' name='userId' value={userId}/>
      <input type='hidden' name='intent' value='PROMOTE_USER'/>
      <IconButton icon='accept' type='submit'/>
    </Form>
  }
  return <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
    <H1 className='text-2xl text-color'>Select new Administrator</H1>
    <fetcher.Form method="post" autoComplete={"on"} className='sticky top-0 z-50' action={'/admin/api/group/members'}>
      <input type='hidden' name='teamId' value={teamId}/>
      <div className="max-w-sm md:max-w-lg">
        <TextInput id="search" label="Search" searchIcon={true}
                   buttonType="submit" defaultValue={""}/>
      </div>
    </fetcher.Form>
    <TeaserList type='Static' title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-color'
                iconFactory={addAsAdminIcon}/>
    {(!fetcher.data || fetcher.data?.members.length === 0) &&
      <div className='w-full h-40 flex flex-col justify-center items-center'>
        <Icons iconName='search' className='w-20 h-20 fill-white'/>
        <H1 className='text-color'>No results</H1>
      </div>
    }
  </Modal>
};

export default function() {
  const { formerTeams } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ selectAdminTeamId: StringOrNull }>();
  const fetcher = useFetcher();
  const { user, memberships } = useOutletContext<SerializeFrom<typeof adminLoader>>()
  const teams = memberships.groups.filter(group => group.group_type === "TEAM");

  const invitedTeams = memberships.groupInvitations.filter(e => e.request_status === RequestStatus.PENDING_USER && e.group_type === "TEAM")
  const pendingTeams = memberships.groupInvitations.filter(e => e.request_status === RequestStatus.PENDING_GROUP && e.group_type === "TEAM")

  const invited = getInvitationTeaser(invitedTeams, user.db.id, false, fetcher);
  const pending = getInvitationTeaser(pendingTeams, user.db.id, true, fetcher);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [deleteFormerModalOpen, setDeleteFormerModalOpen] = useState<string | null>(null);
  const [formerTeamCreateOpen, setFormerTeamCreateOpen] = useState(false);
  const [selectAdminOpen, setSelectAdminOpen] = useState(false);
  useEffect(() => {
    if(actionData?.selectAdminTeamId) {
      setSelectAdminOpen(true)
    }
  }, [actionData]);
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
                                         additionalIcons={mainTeamIcon(member.id, member.is_main_group, user.db.id)}>
                  <Form method='post' className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                    <input type='hidden' name='intent' value='UPDATE_TEAM'/>
                    <input type='hidden' name='userId' value={user.db.id}/>
                    <DateInput name='joinedAt' label='Joined at' value={new Date(member.joined_at)}/>
                    <div className='w-full flex flex-row space-x-4 justify-center'>
                      <ActionButton content='Save' type='submit' name='teamId' value={member.id}/>
                      <ActionButton content='Leave' action={() => setDeleteModalOpen(member.id)}/>
                    </div>
                  </Form>
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
                <Form method='post' className='p-5 flex items-center flex-col space-y-6 w-full max-w-xl mx-auto'>
                  <input type='hidden' name='intent' value='UPDATE_FORMER_TEAM'/>
                  <input type='hidden' name='userId' value={user.db.id}/>
                  <TextInput id='name' label='Team name' defaultValue={formerTeam.name}/>
                  <DateInput name='from' label='From' value={new Date(formerTeam.from || "")}/>
                  <DateInput name='to' label='To' value={new Date(formerTeam.to || "")}/>
                  <div className='w-full flex flex-row space-x-4 justify-center'>
                    <ActionButton content='Save' type='submit' name='formerTeamName' value={formerTeam.name}/>
                    <ActionButton content='Remove' action={() => setDeleteFormerModalOpen(formerTeam.name)}/>
                  </div>
                </Form>
              </ExpandableTeaser>
            })
          }
        </div>
      </div>
    </div>
    {deleteModal(deleteModalOpen, setDeleteModalOpen, 'Do you want to leave the team?', 'LEAVE_TEAM', 'teamId', user.db.id)}
    {deleteModal(deleteFormerModalOpen, setDeleteFormerModalOpen, 'Do you want to delete the former team?', 'LEAVE_FORMER_TEAM', 'formerTeamName', user.db.id)}
    {formerTeamModal(formerTeamCreateOpen, setFormerTeamCreateOpen, user.db.id)}
    {actionData?.selectAdminTeamId && <SelectNewAdminModal isOpen={selectAdminOpen} handleClose={setSelectAdminOpen}
                                                           teamId={actionData?.selectAdminTeamId} userId={user.db.id}/>}
  </>;
};
