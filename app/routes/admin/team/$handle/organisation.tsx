import H1Nav from "~/components/Titles/H1Nav";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";
import { checkHandleAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
import { AccessRight, GroupToGroup, OrganisationTeam, RequestStatus } from "@prisma/client";
import { getOrganisationTeamTeasers } from "~/utils/teaserHelper";
import ActionButton from "~/components/Button/ActionButton";
import H1 from "~/components/Titles/H1";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import IconButton from "~/components/Button/IconButton";
import type { SerializeFrom } from "@remix-run/server-runtime";
import type { loader as handleLoader } from "~/routes/admin/team/$handle";
import { useState } from "react";
import TeaserList from "~/components/Teaser/TeaserList";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import Teaser from "~/components/Teaser/Teaser";
import { createFlashMessage } from "~/services/toast.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await checkUserAuth(request);
  await checkHandleAccessForEntity(user.db.id, params.handle, 'ADMINISTRATOR');
  const data = await zx.parseForm(request, 
    z.object({ teamId: zx.NumAsString, orgId: zx.NumAsString })
  );

  const { teamId, orgId } = data;
  await db.groupToGroup.delete({
    where: {
      child_id_parent_id: {
        child_id: teamId,
        parent_id: orgId
      }
    }
  });
  const headers = await createFlashMessage(request, 'Organisation left');
  return json({}, headers);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { handle } = await zx.parseParams(params, {
    handle: z.string()
  })
  const user = await checkUserAuth(request);
  const access = await checkHandleAccessForEntity(user.db.id, params.handle, 'MODERATOR');

  const allOrgs = await db.groupToGroup.findMany({
    where: {
      child: {
        handle
      }
    },
    include: {
      parent: { include: { children: { include: { child: { include: { game: true }}}}}},
      child: true
    }
  });
  const orgTeams = allOrgs.filter(org => org.request_status === RequestStatus.ACCEPTED);
  const invited = allOrgs.filter(org => org.request_status === RequestStatus.PENDING_GROUP);
  const pending = allOrgs.filter(org => org.request_status === RequestStatus.PENDING_PARENT_GROUP);

  return json({
    access,
    orgTeams,
    invited: getOrganisationTeamTeasers(invited),
    pending: getOrganisationTeamTeasers(pending)
  });
}

const addInvitationIcons = (access: AccessRight, teaser: ITeaserProps, teamId: string, isInOrg: boolean) => {
  if(access === "ADMINISTRATOR") {
    const fetcher = useFetcher();
    return <fetcher.Form method='post' action={'/admin/api/group/parent/invitation'} encType='multipart/form-data' className="flex space-x-2">
      <input type='hidden' name='entityId' value={teamId}/>
      <input type='hidden' name='orgId' value={teaser.id}/>
      <IconButton icon='accept' type='submit' name='action' value='ACCEPT' disabled={isInOrg}/>
      <IconButton icon='decline' type='submit' name='action' value='DECLINE'/>
    </fetcher.Form>;
  }
  return null;
};

const addDeleteIcon = (access: AccessRight, orgTeam: GroupToGroup, setDeleteModalOpen: Function) => {
  if(access === "ADMINISTRATOR") {
    return <IconButton type="button" icon='decline' action={() => setDeleteModalOpen(orgTeam.parent_id)}/>;
  }
  return null;
}

export default function() {
  const { access, orgTeams, invited, pending } = useLoaderData<typeof loader>();

  const { team } = useOutletContext<SerializeFrom<typeof handleLoader>>()
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  return <>
    <div className="mx-3">
      <div className="w-full max-w-lg mx-auto space-y-4 flex flex-col items-center">
        <H1Nav path={'..'} title='Organisation' />
        { orgTeams.length > 0 ? 
          <H1 className='px-4 mb-1 w-full'>Current</H1>
          :
          <H1 className='px-4 mb-1 w-full'>Not in Organisation</H1>
        }
        {
          orgTeams.map(orgTeam => {
            return <Teaser key={orgTeam.parent_id} avatarPath={orgTeam.parent.image} name={orgTeam.parent.name}
                            team={orgTeam.parent.handle}
                            games={[team.game]} 
                            icons={addDeleteIcon(access, orgTeam, setDeleteModalOpen)}/>
          })
        }
        <TeaserList title={'Invitation Requests'} teasers={invited}
                    iconFactory={(teaser) => addInvitationIcons(access, teaser, team.id, (orgTeams.length > 0))}/>
        <TeaserList title={'Invitation Pending'} teasers={pending} staticIcon={
          <Icons iconName='clock' className='h-8 w-8'/>
        }/>
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-white">
        Leave Organisation as Team?
      </div>
      <Form className='flex justify-between gap-2' method="post" onSubmit={() => setDeleteModalOpen(null)}>
        <input type='hidden' name='teamId' value={team.id}/>
        {deleteModalOpen && <ActionButton content='Yes' type='submit' name='orgId' value={deleteModalOpen}/>}
        <ActionButton className='bg-gray-3' content='No' action={() => setDeleteModalOpen(null)}/>
      </Form>
    </Modal>
  </>;
};
