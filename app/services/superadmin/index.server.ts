import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";
import { checkSuperAdmin } from "~/utils/auth.server";

export async function getGameRequests (user: AuthUser) {
  await checkSuperAdmin(user.db.id);
  const gameQuery = db.game.findMany({
    where: {
      is_active: false,
    },
    select: {
      id: true,
      name: true
    }
  });
  
  return await Promise.resolve(gameQuery);
}

export async function getSuperAdmins (user: AuthUser) {
  await checkSuperAdmin(user.db.id);
  const userQuery = db.user.findMany({
    where: {
      is_superadmin: true
    },
    orderBy: {
      name: 'desc'
    },
    include: { games: true }
  });

  return await Promise.resolve(userQuery);
}
