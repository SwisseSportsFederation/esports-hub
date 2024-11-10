import { Prisma } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zx } from "zodix";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import ActionButton from "~/components/Button/ActionButton";
import TeaserList from "~/components/Teaser/TeaserList";
import { entityToPathSegment } from "~/helpers/entityType";
import { AccessRightValue, RequestStatusValue } from '~/models/database.model';
import { db } from "~/services/db.server";
import { createFlashMessage } from "~/services/toast.server";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { isTeamMember } from "~/utils/entityFilters";
import { getTeamMemberTeasers } from "~/utils/teaserHelper";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  /* Apply for Team */
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
          request_status: RequestStatusValue.PENDING_GROUP,
          joined_at: new Date(),
          is_main_group: false,
          role: "Member",
          user: { connect: { id: BigInt(user.db.id) } },
          group: { connect: { id: group.id } }
        }
      })
      console.log(`user ${user.db.id} applied for team ${group.id}`)
    } else {
      console.log(`user ${user.db.id} already has membership in ${group.id}`)
      const headers = await createFlashMessage(request, 'You already applied for this team.');
      return json({}, headers);
    }
  } catch (error) {
    console.log(error);
    const headers = await createFlashMessage(request, 'Error while applying for team');
    return json({}, headers);
  }
  const headers = await createFlashMessage(request, 'Applied for team');
  return json({}, headers);
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loggedIn = await isLoggedIn(request);
  const { handle } = zx.parseParams(params, {
    handle: z.string()
  });

  const team = await db.group.findUniqueOrThrow({
    where: {
      handle
    },
    include: {
      parent: {
        include: {
          parent: true
        }
      },
      game: true,
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
      },
      socials: true,
      languages: true,
      canton: true
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

  let showApply;
  if (loggedIn) {
    const user = await checkUserAuth(request);
    showApply = !isTeamMember(team.members, Number(user.db.id));
  } else {
    showApply = false;
  }
  const memberTeasers = getTeamMemberTeasers(team.name, team.members);
  return json({
    team,
    showApply,
    memberTeasers
  });
}

export default function () {
  const { team, showApply, memberTeasers } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();

  const handleActionClick = () => {
    fetcher.submit({}, {
      action: '',
      method: 'post',
    });
  }

  const orgHeaderProps = (team.parent && team.parent.parent) ? {
    parentLink: `/detail/${entityToPathSegment('ORGANISATION')}/${team.parent.parent.handle}`,
    parentName: team.parent.parent.name
  } : {};

  return <div className="mx-3 py-7">
    <div className="max-w-prose lg:max-w-6xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-12">
        <DetailHeader name={team.name}
          {...orgHeaderProps}
          handle={team.handle}
          imagePath={team.image}
          entitySocials={team.socials}
          games={team.game ? [team.game] : undefined}
          isActive={team.is_active}
          showApply={showApply}
          onApply={handleActionClick} />
        <div className="col-span-2 space-y-4 lg:space-y-6">
          <DetailContentBlock {...team} />
          <div>
            <TeaserList title="Members" teasers={memberTeasers} />
          </div>
          {showApply &&
            <div className="flex items-center justify-center my-7">
              <ActionButton content="Apply" action={handleActionClick} />
            </div>
          }
        </div>
      </div>
    </div>
  </div>;
};
