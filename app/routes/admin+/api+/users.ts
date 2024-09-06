import type { Prisma } from "@prisma/client";
import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { zx } from 'zodix';
import { db } from "~/services/db.server";

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
    const cleanUsers = excludeFromList(users, ['auth_id'])
    return json({ users: cleanUsers });

  } catch (error) {
    console.log(error);
    return json({ users: [] })
  }
}

// Exclude keys from objects in a list
// TODO replace with Prisma omit https://github.com/prisma/prisma/issues/5042 when it's implemented
// More info on prisma omit currently in preview: https://www.prisma.io/docs/orm/reference/prisma-client-reference#omit-preview
export function excludeFromList<T, K extends keyof T>(objects: T[], keysToDelete: K[]): Omit<T, K>[] {
  return objects.map((obj) => excludeFromObject(obj, keysToDelete)) as Omit<T, K>[]
}

// Exclude keys from an object
export function excludeFromObject<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>
}
