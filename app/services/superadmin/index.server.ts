import { db } from "~/services/db.server";
import type { AuthUser } from "~/services/auth.server";
import { checkSuperAdmin } from "~/utils/auth.server";

export async function getGameRequests(user: AuthUser) {
  await checkSuperAdmin(user.db.id);
  const gameQuery = await db.game.findMany({
    where: {
      is_active: false,
    },
    select: {
      id: true,
      name: true
    }
  });

  const acceptedGames = await db.$queryRaw`
    SELECT id, "name", "is_active"
    FROM "game" AS g
    WHERE g.is_active = true
    AND EXISTS (
      SELECT 1 FROM unnest(${gameQuery.map(game => game.name)}::text[]) AS term
      WHERE g."name" ILIKE '%' || term || '%'
    );
  `;

  return { gameRequests: gameQuery, similarGames: acceptedGames };
}

export async function getSuperAdmins(user: AuthUser) {
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
