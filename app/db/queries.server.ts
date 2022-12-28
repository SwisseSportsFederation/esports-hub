import { db } from "~/services/db.server";
import type { Prisma } from "@prisma/client";

const query = (search?: string): Prisma.StringFilter => ({
  contains: search?.toString(),
  mode: 'insensitive'
});

export type StringOrNull = string | null;

type TeamsQuery = {
  id: number;
  image: StringOrNull,
  name: string,
  short_name: StringOrNull,
  game: { name: string } | null;
}[]

type OrgsQuery = {
  id: number;
  image: StringOrNull,
  name: string,
  short_name: StringOrNull
}[]

type UsersQuery = {
  id: number;
  image: StringOrNull,
  nickname: string,
  games: { name: string }[],
  teams: { team: { name: StringOrNull } }[]
}[];

const typeFilter = (name: string, type?: string) => !type || type === name;

const searchQueries = (search?: string, canton?: string, game?: string, language?: string, type?: string): [Promise<UsersQuery>, Promise<TeamsQuery>, Promise<OrgsQuery>] => {
  const u = typeFilter("User", type) ? usersQuery(search, canton, game, language) : Promise.resolve<UsersQuery>([]);
  const t = typeFilter("Team", type) ? teamsQuery(search, canton, game, language) : Promise.resolve<TeamsQuery>([]);
  const o = typeFilter("Organisation", type) ? orgsQuery(search, canton, language) : Promise.resolve<OrgsQuery>([]);
  return [u, t, o];
};

const usersQuery = (search?: string, canton?: string, language?: string, game?: string) => db.user.findMany({
  take: 10,
  where: {
    AND: [
      { canton: { name: { equals: canton } } },
      { languages: { some: { name: language } } },
      { games: { some: { name: game } } },
      { nickname: query(search) }
    ],
  },
  select: {
    id: true,
    image: true,
    nickname: true,
    games: { select: { name: true } },
    teams: { select: { team: { select: { name: true } } } }
  }
});

const teamsQuery = (search?: string, canton?: string, game?: string, language?: string) => db.team.findMany({
  take: 10,
  where: {
    AND: [
      { canton: { name: { equals: canton } } },
      { game: { name: { equals: game } } },
      { languages: { some: { name: language } } },
      {
        OR: [
          { name: query(search) },
          { short_name: query(search) }
        ]
      }
    ]
  },
  select: {
    id: true,
    image: true,
    name: true,
    short_name: true,
    game: {
      select: {
        name: true
      }
    }
  }
});

const orgsQuery = (search?: string, canton?: string, language?: string) => db.organisation.findMany({
  take: 10,
  where: {
    AND: [
      { canton: { name: { equals: canton } } },
      { languages: { some: { name: language } } },
      {
        OR: [
          { name: query(search) },
          { short_name: query(search) }
        ]
      }
    ]
  },
  select: {
    id: true,
    image: true,
    name: true,
    short_name: true
  }
});


export {
  searchQueries
};
