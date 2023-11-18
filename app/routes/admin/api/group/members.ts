import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import type { Prisma} from "@prisma/client";
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { AccessRight, RequestStatus } from "@prisma/client";
import { createFlashMessage } from "~/services/toast.server";
import { AuthUser } from "~/services/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const user = await checkUserAuth(request);

  switch (request.method) {
    case "POST": {
      return inviteUser(request, user)
    }
    case "DELETE": {
      return kickUser(request, user)
    }
    case "PUT": {
      return updateUser(request, user)
    }
    case "GET": {
      return search(request)
    }
  }
  return json({}, 404);
};

const kickUser = async (request: Request, user: AuthUser) => {
  const data = await zx.parseForm(request, {
    groupId: zx.NumAsString, 
    userId: zx.NumAsString 
  });

  const { groupId, userId } = data;
  await checkIdAccessForEntity(user.db.id, groupId, 'MODERATOR');
  if (userId === Number(user.db.id)) {
    throw json({}, 403);
  }
  await db.groupMember.delete({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: groupId
      }
    }
  });
  const headers = await createFlashMessage(request, 'Member kicked');
  return json({ searchResult: [] }, headers);
}

const inviteUser = async (request: Request, user: AuthUser) => {
  const data = await zx.parseForm(request, { 
    groupId: zx.NumAsString, 
    userId: zx.NumAsString 
  });

  const { groupId, userId } = data;
  await checkIdAccessForEntity(user.db.id, groupId, 'MODERATOR');
  try {
    await db.groupMember.create({
      data: {
        joined_at: new Date(),
        access_rights: AccessRight.MEMBER,
        user_id: userId,
        group_id: groupId,
        request_status: RequestStatus.PENDING_USER,
        role: '',
        is_main_group: false
      }
    });
  } catch (error) {
    console.log(error);
    throw json({});
  }

  const headers = await createFlashMessage(request, 'Member invited');
  return json({ searchResult: [] }, headers);
}

const updateUser = async (request: Request, user: AuthUser) => {
  const data = await zx.parseForm(request, { 
    'user-rights': z.enum(['MODERATOR', 'MEMBER', 'ADMINISTRATOR']),
    userId: zx.NumAsString,
    groupId: zx.NumAsString,
    role: z.string()
  });

  const { role, 'user-rights': userRights, groupId, userId } = data;
  await checkIdAccessForEntity(user.db.id, groupId, 'MODERATOR');
  if (userId === Number(user.db.id) && userRights !== AccessRight.ADMINISTRATOR) {
    throw json({}, 403);
  }
  await db.groupMember.update({
    where: {
      user_id_group_id: {
        user_id: userId,
        group_id: groupId
      }
    },
    data: {
      role,
      access_rights: userRights,
    }
  });
  const headers = await createFlashMessage(request, 'Member updated');
  return json({ searchResult: [] }, headers);
}

const search = async (request: Request) => {
  const { teamId, search } = await zx.parseForm(request, {
    teamId: zx.NumAsString,
    search: z.string()
  });
  const query = (): Prisma.StringFilter => ({
    contains: search,
    mode: 'insensitive'
  });
  const members = await db.groupMember.findMany({
    where: {
      group_id: teamId,
      request_status: RequestStatus.ACCEPTED,
      user: {
        OR: [
          { name: query() },
          { surname: query() },
          { handle: query() }
        ]
      }
    },
    include: {
      user: true
    }
  });
  return json({ members });
}
