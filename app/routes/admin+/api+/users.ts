import type { Prisma } from "@prisma/client";
import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { zx } from 'zodix';
import { db } from "~/services/db.server";
import { excludeFromList } from "~/utils/objectExclusion";

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
        }),
        NOT: {
          is_searchable: false
        }
      },
      include: { games: true }
    });
    const cleanUsers = excludeFromList(users, ['auth_id'])
    return json({ users: cleanUsers });

  } catch (error) {
    console.log(error);
    return json({ users: [] })
  }
}
