import H1Nav from "~/components/Titles/H1Nav";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useActionData, useFetcher, useOutletContext } from "@remix-run/react";
import dateInputStyles from "~/styles/date-input.css";
import { json } from "@remix-run/node";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import ExpandableTeaser from "~/components/Teaser/ExpandableTeaser";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { ActionFunctionArgs } from "@remix-run/router";
import { AccessRight, RequestStatus } from "@prisma/client";
import ActionButton from "~/components/Button/ActionButton";
import H1 from "~/components/Titles/H1";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import IconButton from "~/components/Button/IconButton";
import type { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as adminLoader } from "~/routes/admin";
import { useEffect, useState } from "react";
import TeaserList from "~/components/Teaser/TeaserList";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import TextInput from "~/components/Forms/TextInput";
import DateInput from "~/components/Forms/DateInput";
import type { Membership } from "~/services/admin/index.server";
import type { StringOrNull } from "~/db/queries.server";

export function links() {
  return [
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await checkUserAuth(request);
  const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('UPDATE_ORGANISATION'),
      userId: zx.NumAsString,
      organisationId: zx.NumAsString,
      joinedAt: z.string()
    }),
    z.object({
      intent: z.literal('PROMOTE_USER'), organisationId: zx.NumAsString, userId: zx.NumAsString, newAdminUserId: z.string()
    }),
    z.object({ intent: z.literal('LEAVE_ORGANISATION'), organisationId: zx.NumAsString, userId: zx.NumAsString }),
    z.object({
      intent: z.literal('CHANGE_MAIN_ORGANISATION'),
      userId: zx.NumAsString,
      organisationId: zx.NumAsString
    })
  ]));

  const { userId } = data;
  if(userId !== Number(user.db.id)) {
    throw json({}, 403);
  }

  switch(data.intent) {
    case "PROMOTE_USER": {
      const { newAdminUserId, organisationId } = data;
      await checkIdAccessForEntity(user.db.id, organisationId, 'ORGANISATION', 'MEMBER');
      await checkIdAccessForEntity(newAdminUserId, organisationId, 'ORGANISATION', 'MEMBER');

      await db.organisationMember.update({
        where: {
          user_id_organisation_id: {
            user_id: Number(newAdminUserId),
            organisation_id: organisationId
          }
        },
        data: {
          access_rights: AccessRight.ADMINISTRATOR
        }
      });
      // potentially send email
      // purpose fallthrough
    }
    case "LEAVE_ORGANISATION": {
      const { organisationId } = data;
      await checkIdAccessForEntity(user.db.id, organisationId, 'ORGANISATION', 'MEMBER');

      const organisation = await db.organisation.findFirst({
        where: {
          id: organisationId
        },
        include: {
          members: {
            where: {
              request_status: RequestStatus.ACCEPTED,
              access_rights: AccessRight.ADMINISTRATOR
            }
          }
        }
      });
      if(organisation?.members.length === 1 && organisation?.members[0].user_id === BigInt(userId)) {
        return json({ selectAdminOrgId: organisationId })
      }
      const organisationMember = await db.organisationMember.delete({
        where: {
          user_id_organisation_id: {
            user_id: userId,
            organisation_id: organisationId
          }
        }
      });
      return json({});
    }
    case "UPDATE_ORGANISATION": {
      const { joinedAt, organisationId } = data;
      await checkIdAccessForEntity(user.db.id, organisationId, 'ORGANISATION', 'MEMBER');
      await db.organisationMember.update({
        where: {
          user_id_organisation_id: {
            user_id: userId,
            organisation_id: organisationId
          }
        },
        data: {
          ...(joinedAt && ({ joined_at: new Date(joinedAt) })),
        }
      });
      return json({});
    }
    case "CHANGE_MAIN_ORGANISATION": {
      const { organisationId } = data;
      await checkIdAccessForEntity(user.db.id, organisationId, 'ORGANISATION', 'MEMBER');
      await db.organisationMember.updateMany({
        where: {
          user_id: userId
        },
        data: {
          is_main_organisation: false
        }
      });
      await db.organisationMember.update({
        where: {
          user_id_organisation_id: {
            user_id: userId,
            organisation_id: organisationId
          }
        },
        data: {
          is_main_organisation: true
        }
      });
      return json({});
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

const mainOrgIcon = (organisationId: string, isMainOrg: boolean | null, userId: string) =>
  <Form method='post' className={isMainOrg ? 'text-yellow-400' : 'text-gray-3'}>
    <input type='hidden' name='intent' value='CHANGE_MAIN_ORGANISATION'/>
    <input type='hidden' name='userId' value={userId}/>
    <IconButton icon='star' type='submit' name='organisationId' value={organisationId} className="rounded-none mx-1"/>
  </Form>;

const SelectNewAdminModal = (
  { isOpen, handleClose, organisationId, userId }:
    { isOpen: boolean, handleClose: (value: boolean) => void, organisationId: string, userId: string }) => {
  const fetcher = useFetcher();
  useEffect(() => {
    fetcher.submit({ organisationId, search: '' }, { method: 'post', action: '/admin/api/organisation/members' })
  }, [organisationId]);
  // @ts-ignore
  const searchTeaser = (fetcher.data?.members ?? []).map(member => ({ ...member, ...member.user })).filter(member => member.user_id !== userId);

  const addAsAdminIcon = (teaser: ITeaserProps) => {
    return <Form method='post' onSubmit={() => handleClose(false)}>
      <input type='hidden' name='organisationId' value={organisationId}/>
      <input type='hidden' name='newAdminUserId' value={teaser.id}/>
      <input type='hidden' name='userId' value={userId}/>
      <input type='hidden' name='intent' value='PROMOTE_USER'/>
      <IconButton icon='accept' type='submit'/>
    </Form>
  }
  return <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
    <H1 className='text-2xl text-white'>Select new Administrator</H1>
    <fetcher.Form method="post" autoComplete={"on"} className='sticky top-0 z-50' action={'/admin/api/organisation/members'}>
      <input type='hidden' name='organisationId' value={organisationId}/>
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
                      <ActionButton content='Save' type='submit' name='organisationId' value={member.id}/>
                      <ActionButton content='Leave' action={() => setDeleteModalOpen(member.id)}/>
                    </div>
                  </Form>
                </ExpandableTeaser>
              })
          }
        </div>

      </div>
    </div>
    {deleteModal(deleteModalOpen, setDeleteModalOpen, 'Do you want to leave the organisation?', 'LEAVE_ORGANISATION', 'organisationId', user.db.id)}
    {actionData?.selectAdminOrgId && <SelectNewAdminModal isOpen={selectAdminOpen} handleClose={setSelectAdminOpen}
                                                           organisationId={actionData?.selectAdminOrgId} userId={user.db.id}/>}
  </>;
};
