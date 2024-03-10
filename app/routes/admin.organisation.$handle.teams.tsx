import type { Prisma } from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useOutletContext } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { useState } from "react";
import { z } from "zod";
import { zx } from "zodix";
import ActionButton from "~/components/Button/ActionButton";
import IconButton from "~/components/Button/IconButton";
import TextInput from "~/components/Forms/TextInput";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import H1 from "~/components/Titles/H1";
import H1Nav from "~/components/Titles/H1Nav";
import { db } from "~/services/db.server";
import { createFlashMessage } from "~/services/toast.server";
import { checkUserAuth } from "~/utils/auth.server";
import { getTeamTeasers } from "~/utils/teaserHelper";
import type { loader as handleLoader } from '~/routes/admin.organisation.$handle';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  await checkUserAuth(request);
  try {
    const { children } = await db.group.findFirstOrThrow({
      where: {
        handle
      },
      include: { children: { include: { child: { include: { game: true } } } } }
    });
    const accepted = children.filter(team => team.request_status === 'ACCEPTED');
    const invitations = children.filter(team => team.request_status === 'PENDING_PARENT_GROUP');
    const pending = children.filter(team => team.request_status === 'PENDING_GROUP');

    return json({
      accepted: getTeamTeasers(accepted.map(t => t.child)),
      invitations: getTeamTeasers(invitations.map(t => t.child)),
      pending: getTeamTeasers(pending.map(t => t.child))
    });
  } catch(error) {
    console.log(error);
    throw json({}, 404);
  }
}


export async function action({ request }: ActionFunctionArgs) {
  const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
    z.object({ intent: z.literal('invitation'), entityId: zx.NumAsString, action: z.enum(['ACCEPT', 'DECLINE']) }),
    z.object({ intent: z.literal('search'), search: z.string() }),
    z.object({ intent: z.literal('inviteTeam'), entityId: zx.NumAsString, organisationId: zx.NumAsString }),
    z.object({ intent: z.literal('removeTeam'), entityId: zx.NumAsString })
  ]));

  switch(data.intent) {
    case "invitation":
      const { entityId, action } = data;
      if(action === 'ACCEPT') {
        await db.groupToGroup.update({
          where: {
            child_id: entityId
          },
          data: {
            request_status: RequestStatus.ACCEPTED
          }
        })
      } else {
        await db.groupToGroup.delete({
          where: {
            child_id: entityId
          }
        });
      }
      return json({ searchResult: [] });

    case "search":
      const { search } = data;
      const query = (): Prisma.StringFilter => ({
        contains: search,
        mode: 'insensitive'
      });
      try {
        const teams = await db.group.findMany({
          where: {
            OR: [
              { name: query() },
              { handle: query() }
            ]
          },
          include: { game: true }
        });
        const searchResult = getTeamTeasers(teams);
        return json({ searchResult });
      } catch(error) {
        console.log(error);
        throw json({}, 500);
      }

    case 'inviteTeam':
      const { entityId: child_id, organisationId: parent_id } = data;
      try {
        await db.groupToGroup.create({
          data: {
            child_id,
            request_status: RequestStatus.PENDING_GROUP,
            parent_id
          }
        });
        const headers = await createFlashMessage(request, 'Team invited');
        return json({ searchResult: [] }, headers);
      } catch(error) {
        console.log(error);
        throw json({}, 500);
      }
    case "removeTeam":
      const { entityId: teamIdToRemove } = data;
      try {
        await db.groupToGroup.delete({
          where: {
            child_id: teamIdToRemove
          }
        });
        const headers = await createFlashMessage(request, 'Team removed');
        return json({ searchResult: [] }, headers);
      } catch(error) {
        console.log(error);
        throw json({}, 500);
      }
  }
}


const addInvitationIcons = (teaser: ITeaserProps) => {
  return <Form method='post'>
    <input type='hidden' name='intent' value='invitation'/>
    <input type='hidden' name='entityId' value={teaser.id}/>
    <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
    <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
  </Form>;
};

export default function() {
  let {
    accepted,
    invitations,
    pending
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { organisation } = useOutletContext<SerializeFrom<typeof handleLoader>>()
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const addAcceptedIcons = (teaser: ITeaserProps) => {
    return <IconButton icon='decline' type='button' action={() => setDeleteModalOpen(teaser.id)}/>
  };

  const searchTeaser = (actionData?.searchResult ?? []).filter(team => ![...invitations, ...pending, ...accepted].some(t => t.id === team.id));

  const addSearchIcons = (teaser: ITeaserProps) => {
    return <Form method='put' onSubmit={() => setInviteModalOpen(false)}>
      <input type='hidden' name='organisationId' value={organisation.id}/>
      <input type='hidden' name='entityId' value={teaser.id}/>
      <input type='hidden' name='intent' value='inviteTeam'/>
      <IconButton icon='add' type='submit'/>
    </Form>
  }

  return <>
    <div className="mx-3">
      <div className="w-full max-w-prose mx-auto">
        <H1Nav path={'..'} title='Teams'>
          <ActionButton content='Invite' action={() => setInviteModalOpen(true)} className='w-1/5'/>
        </H1Nav>
        <TeaserList title={'Teams in Organisation'} teasers={accepted} iconFactory={addAcceptedIcons}/>
        <TeaserList title={'Invitations'} teasers={invitations} iconFactory={addInvitationIcons}/>
        <TeaserList title={'Invitation Requests'} teasers={pending}
                    staticIcon={<Icons iconName='clock' className='h-8 w-8'/>}/>
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-color">
        Remove Team?
      </div>
      <Form className='flex justify-between gap-2' method="post" onSubmit={() => setDeleteModalOpen(null)}>
        <input type='hidden' name='intent' value='removeTeam'/>
        {deleteModalOpen && <ActionButton content='Yes' type='submit' name='entityId' value={deleteModalOpen}/>}
        <ActionButton className='bg-gray-3' content='No' action={() => setDeleteModalOpen(null)}/>
      </Form>
    </Modal>
    <Modal isOpen={inviteModalOpen} handleClose={() => setInviteModalOpen(false)}>
      <Form method="post" autoComplete={"on"} className='sticky top-0 z-50'>
        <input type='hidden' name='intent' value='search'/>
        <div className="max-w-sm md:max-w-lg">
          <TextInput id="search" label="Search" searchIcon={true}
                     buttonType="submit" defaultValue={""}/>
        </div>
      </Form>
      <TeaserList title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-color'
                  iconFactory={addSearchIcons}/>
      {searchTeaser.length === 0 &&
        <div className='w-full h-40 flex flex-col justify-center items-center'>
          <Icons iconName='search' className='w-20 h-20 fill-white'/>
          <H1 className='text-color'>No results</H1>
        </div>
      }
    </Modal>
  </>
}
