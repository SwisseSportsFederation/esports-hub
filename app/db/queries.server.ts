import { db } from "~/services/db.server";
import type { Prisma } from "@prisma/client";
import { EntityType } from "~/helpers/entityType";

const query = (search?: string): Prisma.StringFilter => ({
  contains: search?.toString(),
  mode: 'insensitive'
});

export type StringOrNull = string | null;

type TeamsQuery = {
  id: bigint,
  image: StringOrNull,
  name: string,
  handle: string,
  game: { name: string } | null;
}[]

type OrgsQuery = {
  id: bigint,
  image: StringOrNull,
  name: string,
  handle: string
}[]

type UsersQuery = {
  id: bigint,
  image: StringOrNull,
  handle: string,
  games: { name: string }[],
  teams: { team: { name: StringOrNull } }[]
}[];

type EntityQuery = {
  id: bigint,
  image: StringOrNull,
  handle: string,
  games: string[],
  team?: string[],
  entity_type: EntityType
}[];

const searchQuery = (search?: string, canton?: string, game?: string, language?: string, type?: string, offset?: number): Promise<EntityQuery[]> => {
  const searchString = `%${search?.toLowerCase()}%`;
  return db.$queryRaw<EntityQuery[]>`
  SELECT
      u2.id,
      u2.handle,
      u2.image,
      u2.games,
      t.name AS team,
      'USER' AS entity_type
  FROM
      (SELECT
          u.id,
          u.handle,
          u.image,
          array_agg(g.name) AS games 
      FROM
          "public"."user" u 
      INNER JOIN
          "public"."_GameToUser" gu
              ON u.id = gu."B"
      INNER JOIN
          "public"."game" g
            ON gu."A" = g.id
      WHERE
          LOWER(u.handle) LIKE ${searchString}
      GROUP BY
          (u.id,
          u.handle,
          u.image)) AS u2 
  INNER JOIN
      "public"."team_member" tm 
          ON u2.id = tm.user_id 
  INNER JOIN
      "public"."team" t 
          ON t.id = tm.team_id 
  WHERE
      tm.is_main_team = true 

  UNION ALL

  SELECT
      t2.id,
      t2.handle,
      t2.image,
      array_agg(g2.name) AS games,
      '' AS team,
      'TEAM' AS entity_type 
  FROM
      "public"."team" t2
	INNER JOIN
      "public"."game" g2
			ON t2.game_id = g2.id
  WHERE
      LOWER(t2.handle) LIKE ${searchString}
  GROUP BY
      (t2.id,
      t2.handle,
      t2.image) 

  UNION ALL
    
  SELECT
      org.id,
      org.handle,
      org.image,
      array_agg(g3.name) AS games,
      '' AS team,
      'ORG' AS entity_type 
  FROM
      "public"."organisation" AS org 
  INNER JOIN
      "public"."organisation_team" ot 
          ON org.id = ot.organisation_id 
  INNER JOIN
      "public"."team" t3 
          ON ot.team_id = t3.id 
	INNER JOIN
      "public"."game" g3
			ON t3.game_id = g3.id
  WHERE
      LOWER(org.handle) LIKE ${searchString}
  GROUP BY
      (org.id,
      org.handle,
      org.image)
`

// TODO Test
// TODO Offset
// TODO Canton etc. filtering
}

const typeFilter = (name: string, type?: string) => !type || type === name;

const searchQueries = (search?: string, canton?: string, game?: string, language?: string, type?: string, offsetOrg?: number, offsetTeam?: number, offsetUser?: number): [Promise<UsersQuery>, Promise<TeamsQuery>, Promise<OrgsQuery>] => {
  const u = typeFilter("User", type) ? usersQuery(search, canton, game, language, offsetUser ?? 0) : Promise.resolve<UsersQuery>([]);
  const t = typeFilter("Team", type) ? teamsQuery(search, canton, game, language, offsetTeam ?? 0) : Promise.resolve<TeamsQuery>([]);
  const o = typeFilter("Organisation", type) ? orgsQuery(search, canton, language, offsetOrg ?? 0) : Promise.resolve<OrgsQuery>([]);
  return [u, t, o];
};

const usersQuery = (search?: string, canton?: string, language?: string, game?: string, offset?: number) => db.user.findMany({
  where: {
    AND: [
      ...(canton ? [{ canton: { name: { equals: canton } } }] : []),
      ...(language ? [{ languages: { some: { name: language } } }] : []),
      ...(game ? [{ games: { some: { name: game } } }] : []),
      ...(search ? [{ OR: [
        { handle: query(search) },
        { name: query(search) },
        { surname: query(search) }
      ]}
      ] : [])
    ],
  },
  select: {
    id: true,
    image: true,
    handle: true,
    games: { select: { name: true } },
    teams: { select: { team: { select: { name: true } } } }
  },
  skip: offset,
  take: 5
});

const teamsQuery = (search?: string, canton?: string, game?: string, language?: string, offset?: number) => db.team.findMany({
  where: {
    AND: [
      ...(canton ? [{ canton: { name: { equals: canton } } }] : []),
      ...(language ? [{ languages: { some: { name: language } } }] : []),
      ...(game ? [{ game: { name: game } }] : []),
      ...(search ? [{ OR: [
        { handle: query(search) },
        { name: query(search) },
      ]}
      ] : [])
    ]
  },
  select: {
    id: true,
    image: true,
    name: true,
    handle: true,
    game: {
      select: {
        name: true
      }
    }
  },
  skip: offset,
  take: 5,
});

const orgsQuery = (search?: string, canton?: string, language?: string, offset?: number) => db.organisation.findMany({
  where: {
    AND: [
      ...(canton ? [{ canton: { name: { equals: canton } } }] : []),
      ...(language ? [{ languages: { some: { name: language } } }] : []),
      ...(search ? [{ OR: [
        { handle: query(search) },
        { name: query(search) },
      ]}
      ] : [])
    ]
  },
  select: {
    id: true,
    image: true,
    name: true,
    handle: true
  },
  skip: offset,
  take: 5
});


export {
  searchQueries,
  searchQuery
};

