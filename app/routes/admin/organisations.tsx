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

export function links() {
  return [
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

// TODO: Put all the api functions here into an own api endpoint. /organisations and /teams should then call this endpoint instead of having duplicate code. (remove api code from /teams)

const promoteUser = async (userId: number, newAdminUserId: string, groupId: number) => {
  await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');
  await checkIdAccessForEntity(newAdminUserId, groupId, 'MEMBER');

  await db.groupMember.update({
    where: {
      user_id_group_id: {
        user_id: Number(newAdminUserId),
        group_id: groupId
      }
    },
    data: {
      access_rights: AccessRight.ADMINISTRATOR
    }
  });
  // todo: potentially send email
}

const leaveOrganisation = async (userId: number, groupId: number) => {
  await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');

  const group = await db.group.findFirst({
    where: {
      id: groupId
    },
    include: {
      members: true
    }
  });
  // Set Organisation inactive if there is no more members
  if(group?.members.length === 1) {
    await db.group.update({
      where: {
        id: groupId
      },
      data: {
        is_active: false
      }
    });
  } else {
    // Set new admin if member is last admin
    const admins = group?.members.filter(m => m.request_status === RequestStatus.ACCEPTED && m.access_rights === AccessRight.ADMINISTRATOR);
    if(admins?.length === 1 && admins[0].user_id === BigInt(userId)) {
      return json({ selectAdminOrgId: groupId })
    }
  }
  // delete member from organisation
  const groupMember = await db.groupMember.delete({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: groupId
      }
    }
  });

  // TODO: Check if this works like this and has correct variables. (group_type etc.)
  if(group && group.group_type === "TEAM") {
    await db.formerTeam.create({
      data: {
        user_id: userId,
        name: group.name,
        from: groupMember.joined_at,
        to: new Date(),
      }
    });
  }
  return json({});
}

const updateOrganisation = async (userId: number, groupId: number, joinedAt: string) => {
  await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');
  await db.groupMember.update({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: groupId
      }
    },
    data: {
      joined_at: new Date(joinedAt)
    }
  });
  return json({});
}

const changeMainOrganisation = async (userId: number, groupId: number) => {
  await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');
  //TODO: Check group type here to be organisation before removing main group (because of main teams)
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
        group_id: groupId
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
      intent: z.literal('UPDATE_ORGANISATION'),
      userId: zx.NumAsString,
      groupId: zx.NumAsString,
      joinedAt: z.string()
    }),
    z.object({
      intent: z.literal('PROMOTE_USER'), groupId: zx.NumAsString, userId: zx.NumAsString, newAdminUserId: z.string()
    }),
    z.object({ intent: z.literal('LEAVE_ORGANISATION'), groupId: zx.NumAsString, userId: zx.NumAsString }),
    z.object({
      intent: z.literal('CHANGE_MAIN_ORGANISATION'),
      userId: zx.NumAsString,
      groupId: zx.NumAsString
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
      const { newAdminUserId, groupId } = data;
      promoteUser(userId, newAdminUserId, groupId);
      // purpose fallthrough
    }
    case "LEAVE_ORGANISATION": {
      const { groupId } = data;
      return leaveOrganisation(userId, groupId);
    }
    case "UPDATE_ORGANISATION": {
      const { joinedAt, groupId } = data;
      if(joinedAt) {
        return updateOrganisation(userId, groupId, joinedAt);
      } else {
        throw json({}, 400);
      }
    }
    case "CHANGE_MAIN_ORGANISATION": {
      const { groupId } = data;
      return changeMainOrganisation(userId, groupId);
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

const deleteModal = (isOpen: StringOrNull, activeFunction: Function, text: string, intent: string, submitName: string, userId: string) =>
  <Modal isOpen={!!isOpen} handleClose={() => activeFunction(null)}>
    <div className="flex justify-center text-center text-2xl mb-8 text-white">
      {text}
    </div>
    <Form className='flex justify-between gap-2' method="post" onSubmit={() => activeFunction(null)}>
      <input type='hidden' name='intent' value={intent}/>
      <input type='hidden' name='userId' value={userId}/>
      {isOpen && <ActionButton content='Yes' type='submit' name={submitName} value={isOpen}/>}
      <ActionButton className='bg-gray-3' content='No' action={() => activeFunction(null)}/>
    </Form>
  </Modal>;

const mainOrgIcon = (groupId: string, isMainOrg: boolean | null, userId: string) =>
  <Form method='post' className={isMainOrg ? 'text-yellow-400' : 'text-gray-3'}>
    <input type='hidden' name='intent' value='CHANGE_MAIN_ORGANISATION'/>
    <input type='hidden' name='userId' value={userId}/>
    <IconButton icon='star' type='submit' name='groupId' value={groupId} className="rounded-none mx-1"/>
  </Form>;

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
    return <Form method='post' onSubmit={() => handleClose(false)}>
      <input type='hidden' name='groupId' value={groupId}/>
      <input type='hidden' name='newAdminUserId' value={teaser.id}/>
      <input type='hidden' name='userId' value={userId}/>
      <input type='hidden' name='intent' value='PROMOTE_USER'/>
      <IconButton icon='accept' type='submit'/>
    </Form>
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
                                         additionalIcons={mainOrgIcon(member.id, member.is_main_team, user.db.id)}>
                  <Form method='post' className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                    <input type='hidden' name='intent' value='UPDATE_ORGANISATION'/>
                    <input type='hidden' name='userId' value={user.db.id}/>
                    <DateInput name='joinedAt' label='Joined at' value={new Date(member.joined_at)}/>
                    <div className='w-full flex flex-row space-x-4 justify-center'>
                      <ActionButton content='Save' type='submit' name='groupId' value={member.id}/>
                      <ActionButton content='Leave' action={() => setDeleteModalOpen(member.id)}/>
                    </div>
                  </Form>
                </ExpandableTeaser>
              })
          }
        </div>

      </div>
    </div>
    {deleteModal(deleteModalOpen, setDeleteModalOpen, 'Do you want to leave the organisation?', 'LEAVE_ORGANISATION', 'groupId', user.db.id)}
    {actionData?.selectAdminOrgId && <SelectNewAdminModal isOpen={selectAdminOpen} handleClose={setSelectAdminOpen}
                                                           groupId={actionData?.selectAdminOrgId} userId={user.db.id}/>}
  </>;
};
