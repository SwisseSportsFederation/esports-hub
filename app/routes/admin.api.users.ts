import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import type { Prisma } from "@prisma/client";
import { z } from "zod";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { search, notInTeam } = await zx.parseForm(request, {
    search: z.string(),
    notInTeam: zx.NumAsString.optional()
  });

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
        ],
      ...(notInTeam && {
        groups: {
          none: {
            group_id: notInTeam
          }
        }
      })

      },
      include: { games: true }
    });
    return json({ users });
  } catch(error) {
    console.log(error);
    return json({ users: [] })
  }
}
