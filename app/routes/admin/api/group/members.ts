import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import type { Prisma} from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { z } from "zod";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
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
};
