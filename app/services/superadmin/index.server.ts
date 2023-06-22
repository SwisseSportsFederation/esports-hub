import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";

export async function getGameRequests(user: AuthUser) {
  /* TODO: CHECK IF SUPERADMIN */
  const gameQuery = db.game.findMany({
    where: {
      is_active: false,
    },
    select: {
      id: true,
      name: true
    }
  });
  const games = await Promise.resolve(gameQuery);

  return games;
}

export async function getSuperAdmins(user: AuthUser) {
  /* TODO: CHECK IF SUPERADMIN */
  const userQuery = db.user.findMany({
    where: {
      is_superadmin: true
    },
    orderBy: {
      name: 'desc'
    },
    include: { games: true }
  });
  
  const superadmins = await Promise.resolve(userQuery);
  
  return superadmins;
}
