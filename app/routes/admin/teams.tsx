import H1Nav from "~/components/Titles/H1Nav";
import type { FetcherWithComponents } from "@remix-run/react";
import { Form, useActionData, useFetcher, useOutletContext, useLoaderData } from "@remix-run/react";
import dateInputStyles from "~/styles/date-input.css";
import { json } from "@remix-run/node";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import ExpandableTeaser from "~/components/Teaser/ExpandableTeaser";
import { db } from "~/services/db.server";
import { zx } from "zodix";
import { z } from "zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/router";
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
import { AuthUser } from "~/services/auth.server";

export function links() {
  return [
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

// TODO make correct actions
export async function action({ request, params }: ActionFunctionArgs) {
  const user = await checkUserAuth(request);
  const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('UPDATE_TEAM'),
      userId: zx.NumAsString,
      teamId: zx.NumAsString,
      joinedAt: z.string()
    }),
    z.object({ intent: z.literal('SEARCH'), search: z.string() }),
    z.object({ intent: z.literal('LEAVE_TEAM'), teamId: zx.NumAsString, userId: zx.NumAsString }),
    z.object({
      intent: z.literal('UPDATE_FORMER_TEAM'),
      userId: zx.NumAsString,
      formerTeamName: z.string(),
      from: z.string(),
      to: z.string(),
      name: z.string()
    }),
  ]));

  switch(data.intent) {
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
    case "LEAVE_TEAM": {
      const { teamId, userId } = data;
      await checkIdAccessForEntity(user, teamId, 'TEAM', 'MEMBER');
      if(userId !== Number(user.db.id)) {
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
      // TODO handle Admin leaving team to give other person admin.
      // TODO add to team to former teams.
      return json({ searchResult: [] });
    }
    case "UPDATE_TEAM": {
      const { joinedAt, teamId, userId } = data;
      console.log("userid: " + userId);
      console.log("teamid: " + teamId);
      await checkIdAccessForEntity(user, teamId, 'TEAM', 'MEMBER');
      if(userId !== Number(user.db.id)) {
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
          ...(joinedAt && ({ joined_at: new Date(joinedAt) })),
        }
      });
      return json({ searchResult: [] });
    }
    case "UPDATE_FORMER_TEAM": {
      const { name, from, to, formerTeamName, userId } = data;
      if(userId !== Number(user.db.id)) {
        throw json({}, 403);
      }
      await db.formerTeam.update({
        where: {
          user_id_name: {
            user_id: userId,
            name: formerTeamName
          }
        },
        data: {
          name,
          ...(from && ({ from: new Date(from) })),
          ...(to && ({ to: new Date(to) })),
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

async function getFormerTeams(user: AuthUser) {
  const formerTeams = await db.formerTeam.findMany({
    where: {
      user_id: Number(user.db.id)
    }
  });
  return formerTeams;
}

function sortAsc(dateA: Date | null, dateB: Date | null) {
  dateA = dateA || new Date();
  dateB = dateB || new Date();
  return dateA.getTime() - dateB.getTime();
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  let formerTeams = await getFormerTeams(user);
  formerTeams = formerTeams.sort((objA, objB) => sortAsc(objA.from, objB.from));
  return json({
    formerTeams
  });
};

export default function() {
  const actionData = useActionData<typeof action>();
  const { formerTeams } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const { user, memberships } = useOutletContext<SerializeFrom<typeof adminLoader>>()
  const members = memberships.teams;
  const invited = getInvitationTeaser(memberships.invitations.filter(e => e.request_status === RequestStatus.PENDING_USER), user.db.id, false, fetcher);
  const pending = getInvitationTeaser(memberships.invitations.filter(e => e.request_status === RequestStatus.PENDING_TEAM), user.db.id, true, fetcher);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const searchTeaser = (actionData?.searchResult ?? [])
    .filter(team => ![...pending, ...invited].some(t => t.id === team.id))
    .filter(team => !members.some(mem => mem.team_id === team.id));

  return <>
    <div className="mx-3">
      <div className="w-full max-w-lg mx-auto space-y-4 flex flex-col items-center">
        <H1Nav path={'..'} title='My Teams'/>
        <TeaserList title={'Invitation Requests'} teasers={invited}/>
        <TeaserList title={'Invitation Pending'} teasers={pending}/>
        <H1 className='px-2 mb-1 w-full'>Active</H1>
        {
          members.sort((objA, objB) => sortAsc(new Date(objA.joined_at), new Date(objB.joined_at)))
          .map(member => {
            // Add main team button
            return <ExpandableTeaser key={member.team.id} avatarPath={member.team.image} name={member.team.name}
                                     team={member.team.handle}
                                     games={member.team.game}>
              <Form method='post' className='p-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
                <input type='hidden' name='intent' value='UPDATE_TEAM'/>
                <input type='hidden' name='userId' value={user.db.id}/>
                <DateInput name='joinedAt' label='Joined at' value={new Date(member.joined_at)}/>
                <div className='w-full flex flex-row space-x-4 justify-center'>
                  <ActionButton content='Save' type='submit' name='teamId' value={member.team.id}/>
                  <ActionButton content='Leave' action={() => setDeleteModalOpen(member.team.id)}/>
                </div>
              </Form>
            </ExpandableTeaser>
          })
        }
        <H1 className='px-2 mb-1 w-full'>Former</H1>
        {
          // Add Former Team Add
          // Add Former Team name search
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
                  <ActionButton content='Leave' action={() => setDeleteModalOpen(formerTeam.id)}/>
                </div>
              </Form>
            </ExpandableTeaser>
          })
        }
      </div>
    </div>
    <Modal isOpen={!!deleteModalOpen} handleClose={() => setDeleteModalOpen(null)}>
      <div className="flex justify-center text-center text-2xl mb-8 text-white">
        Do you want to leave the team?
      </div>
      <Form className='flex justify-between gap-2' method="post" onSubmit={() => setDeleteModalOpen(null)}>
        <input type='hidden' name='intent' value='LEAVE_TEAM'/>
        <input type='hidden' name='userId' value={user.db.id}/>
        {deleteModalOpen && <ActionButton content='Yes' type='submit' name='teamId' value={deleteModalOpen}/>}
        <ActionButton className='bg-gray-3' content='No' action={() => setDeleteModalOpen(null)}/>
      </Form>
    </Modal>
  </>;
};