import { Prisma } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import { z } from "zod";
import { zx } from "zodix";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import ActionButton from "~/components/Button/ActionButton";
import { ToastMessageListener } from "~/components/Notifications/ToastMessageListener";
import TeaserList from "~/components/Teaser/TeaserList";
import { AccessRightValue, RequestStatusValue } from '~/models/database.model';
import { db } from "~/services/db.server";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { getOrganisationGames, isOrganisationMember } from "~/utils/entityFilters";
import { getOrganisationMemberTeasers, getTeamTeasers } from "~/utils/teaserHelper";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  /* Apply for Organisation */
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });
  const user = await checkUserAuth(request);
  try {
    const group = await db.group.findUniqueOrThrow({
      where: {
        handle
      }
    });
    const existingGroupMember = await db.groupMember.findFirst({
      where: {
        user_id: user.db.id,
        group_id: group.id
      }
    });
    if (!existingGroupMember) {
      await db.groupMember.create({
        data: {
          access_rights: AccessRightValue.MEMBER,
          is_main_group: false,
          request_status: RequestStatusValue.PENDING_GROUP,
          joined_at: new Date(),
          role: "Member",
          user: { connect: { id: BigInt(user.db.id) } },
          group: { connect: { id: group.id } }
        }
      })
      console.log(`user ${user.db.id} applied for group ${group.id}`)
    } else {
      console.log(`user ${user.db.id} already has membership in ${group.id}`)
      return json({ toast: 'You already applied for this organisation.' });
    }
  } catch (error) {
    console.log(error);
    return json({ toast: 'Error while applying for group' });
  }
  return json({ toast: 'Applied for group' });
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedIn = await isLoggedIn(request);
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  const organisation = await db.group.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      socials: true,
      canton: true,
      languages: true,
      children: { include: { child: { include: { game: true } } } },
      members: {
        where: {
          request_status: RequestStatusValue.ACCEPTED
        },
        include: {
          user: {
            include: {
              games: {
                where: {
                  is_active: true,
                },
              }
            }
          }
        }
      }
    }
  }).catch((e) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2015') {
        throw new Response("Not Found", {
          status: 404,
        })
      } else {
        throw new Response("Server Error", {
          status: 500,
          statusText: `Server Error: ${e.code}`
        })
      }
    } else {
      throw new Response("Server Error", {
        status: 500,
        statusText: "Server Error"
      })
    }
  });

  let showApply = false;
  if (loggedIn) {
    const user = await checkUserAuth(request);
    showApply = !isOrganisationMember(organisation.members, Number(user.db.id));
  }

  const teamTeasers = getTeamTeasers(organisation.children.map(t => t.child))
  const memberTeasers = getOrganisationMemberTeasers(organisation.members)
  return json({
    organisation,
    showApply,
    teasers: {
      teamTeasers,
      memberTeasers
    }
  });
}

export default function () {
  const { organisation, showApply, teasers } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();

  const handleActionClick = () => {
    fetcher.submit({}, {
      action: '',
      method: 'post',
    });
  }

  return <div className="mx-3 py-7">
    <div className="max-w-prose lg:max-w-6xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-12">
        <DetailHeader name={organisation.name}
          handle={organisation.handle}
          imagePath={organisation.image}
          entitySocials={organisation.socials}
          games={getOrganisationGames(organisation)}
          isActive={organisation.is_active}
          showApply={showApply}
          onApply={handleActionClick} />
        <div className="col-span-2 space-y-4 lg:space-y-6">
          <DetailContentBlock {...organisation} />
          <div className="">
            <TeaserList title="Teams" teasers={teasers.teamTeasers} />
            <TeaserList title="Members" teasers={teasers.memberTeasers} />
          </div>
          {showApply &&
            <div className="my-7">
              <ActionButton content="Apply" action={handleActionClick} />
            </div>
          }
        </div>
      </div>
    </div>
    <ToastMessageListener />
  </div>;
};
