import { db } from "~/services/db.server";
import type { Prisma } from "@prisma/client";

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
  searchQueries
};
