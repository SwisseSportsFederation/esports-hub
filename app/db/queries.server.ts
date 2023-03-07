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
  games: { name: string }[],
  teams: { team: { name: StringOrNull } }[],
  entity_type: EntityType
}[];

const searchQuery = (search?: string, canton?: string, game?: string, language?: string, type?: string, offset?: number): Promise<EntityQuery[]> => {
  const searchString = `'%${search}%'`;
  
  return db.$queryRaw<EntityQuery[]>`
  SELECT u2.id, u2.handle, u2.image, u2.game_id, short_name, 'USER' AS entity_type FROM (
    SELECT u.id, u.handle, u.image, array_agg(ug.A) AS game_id FROM User u
    INNER JOIN _GameToUser ug
       ON u.id = ug.B
    WHERE LOWER(handle) LIKE ${searchString}
    GROUP BY (u.id, u.handle, u.image)
  ) AS u2
  INNER JOIN TeamMember tm
      ON u2.id = tm.user_id
  INNER JOIN Team t2
      ON t2.id = tm.team_id
  WHERE tm.is_main_team = true

  UNION

  SELECT id, handle, image, array_agg(game_id), short_name, 'TEAM' AS entity_type FROM teams
  WHERE LOWER(handle) LIKE ${searchString}
  GROUP BY (id, handle, image)

  UNION

  SELECT org.id, org.handle, org.image, array_agg(game_id), org.short_name, 'ORG' AS entity_type FROM organisations AS org
  INNER JOIN organisation_team ot
      ON org.id = ot.organisation_id
  INNER JOIN team t3
      ON ot.team_id = t3.id
  WHERE LOWER(org.handle) LIKE ${searchString}
  GROUP BY (org.id, org.handle, org.image)
`
// TODO Test
// TODO Offset
// TODO Game Names instead of IDs
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
