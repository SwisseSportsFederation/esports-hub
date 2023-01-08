import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { zx } from "zodix";
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useOutletContext } from "@remix-run/react";
import H1Nav from "~/components/Titles/H1Nav";
import TeaserList from "~/components/Teaser/TeaserList";
import { getTeamTeasers } from "~/utils/teaserHelper";
import { ITeaserProps } from "~/components/Teaser/Teaser";
import IconButton from "~/components/Button/IconButton";
import Icons from "~/components/Icons";
import ActionButton from "~/components/Button/ActionButton";
import Modal from "~/components/Notifications/Modal";
import { useState } from "react";
import TextInput from "~/components/Forms/TextInput";
import { Prisma, RequestStatus } from "@prisma/client";
import H1 from "~/components/Titles/H1";
import { SerializeFrom } from "@remix-run/server-runtime";
import { loader as handleLoader } from '../$handle';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  await checkUserAuth(request);
  try {
    const { teams } = await db.organisation.findFirstOrThrow({
      where: {
        handle
      },
      include: { teams: { include: { team: { include: { game: true } } } } }
    });
    const accepted = teams.filter(team => team.request_status === 'ACCEPTED');
    const invitations = teams.filter(team => team.request_status === 'PENDING_ORG');
    const pending = teams.filter(team => team.request_status === 'PENDING_TEAM');

    return json({
      accepted: getTeamTeasers(accepted.map(t => t.team)),
      invitations: getTeamTeasers(invitations.map(t => t.team)),
      pending: getTeamTeasers(pending.map(t => t.team))
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
        await db.organisationTeam.update({
          where: {
            team_id: entityId
          },
          data: {
            request_status: RequestStatus.ACCEPTED
          }
        })
      } else {
        await db.organisationTeam.delete({
          where: {
            team_id: entityId
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
        const teams = await db.team.findMany({
          where: {
            OR: [
              { name: query() },
              { handle: query() }
            ],
            organisation: null
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
      const { entityId: team_id, organisationId: organisation_id } = data;
      try {
        console.log(team_id, organisation_id);
        await db.organisationTeam.create({
          data: {
            team_id,
            request_status: RequestStatus.PENDING_TEAM,
            organisation_id
          }
        });
        return json({ searchResult: [] });
      } catch(error) {
        console.log(error);
        throw json({}, 500);
      }
    case "removeTeam":
      const { entityId: teamIdToRemove } = data;
      try {
        await db.organisationTeam.delete({
          where: {
            team_id: teamIdToRemove
          }
        });
        return json({ searchResult: [] });
      } catch(error) {
        console.log(error);
        throw json({}, 500);
      }
  }
}

const addIconsToInvitations = (invitations: Omit<ITeaserProps, "icons">[]): ITeaserProps[] => invitations.map(team => {
  const icons = <Form method='post'>
    <input type='hidden' name='intent' value='invitation'/>
    <input type='hidden' name='entityId' value={team.entityId}/>
    <IconButton icon='accept' type='submit' name='action' value='ACCEPT'/>
    <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
  </Form>;

  return {
    ...team,
    icons
  }
});

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

  const acceptedWithIcons: ITeaserProps[] = accepted.map(team => ({
    ...team,
    icons: <IconButton icon='decline' type='button' action={() => setDeleteModalOpen(team.entityId)}/>
  }));

  const pendingWithIcons: ITeaserProps[] = pending.map(team => ({
    ...team,
    icons: <Icons iconName='clock' className='h-8 w-8'/>
  }));
  const invitationsWithIcons = addIconsToInvitations(invitations);

  const searchTeaser: ITeaserProps[] = (actionData?.searchResult ?? []).filter(team => !accepted.concat(invitations).concat(pending).some(t => t.entityId === team.entityId)).map(team => ({
    ...team,
    icons: <Form method='put' onSubmit={() => setInviteModalOpen(false)}>
      <input type='hidden' name='organisationId' value={organisation.id}/>
      <input type='hidden' name='entityId' value={team.entityId}/>
      <input type='hidden' name='intent' value='inviteTeam'/>
      <IconButton icon='add' type='submit' name='' value=''/>
    </Form>
  }));

  return <>
    <div className="mx-3">
      <div className="w-full max-w-prose mx-auto">
        <H1Nav path={'..'} title='Teams'>
          <ActionButton content='Invite' action={() => setInviteModalOpen(true)} className='w-1/5'/>
        </H1Nav>
        {acceptedWithIcons.length > 0 && <TeaserList title={'Teams in Organisation'} teasers={acceptedWithIcons}/>}
        {invitationsWithIcons.length > 0 && <TeaserList title={'Invitations'} teasers={invitationsWithIcons}/>}
        {pendingWithIcons.length > 0 && <TeaserList title={'Invitation Pending'} teasers={pendingWithIcons}/>}
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-white">
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
      {searchTeaser.length > 0 &&
        <TeaserList title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-white'/>}
      {searchTeaser.length === 0 &&
        <div className='w-full h-40 flex flex-col justify-center items-center'>
          <Icons iconName='search' className='w-20 h-20 fill-white'/>
          <H1 className='text-white'>No results</H1>
        </div>
      }
    </Modal>
  </>
};
