import { db } from "~/services/db.server";
import { Prisma, PrismaPromise } from "@prisma/client";

const query = (search?: string): Prisma.StringNullableFilter => ({
  contains: search?.toString(),
  mode: 'insensitive'
});

export type StringOrNull = string | null;

type TeamsQuery = {
  image: StringOrNull,
  name: StringOrNull,
  short_name: StringOrNull,
  games: { name: StringOrNull } | null;
}[]

type OrgsQuery = {
  image: StringOrNull,
  name: StringOrNull,
  short_name: StringOrNull
}[]

type UsersQuery = {
  image: StringOrNull,
  nickname: StringOrNull,
  user_games: { games: { name: StringOrNull } }[],
  team_members: { teams: { name: StringOrNull } }[]
}[];

const typeFilter = (name: string, type?: string) => !type || type === name;

const searchQueries = (search?: string, canton?: string, game?: string, language?: string, type?: string): [Promise<UsersQuery>, Promise<TeamsQuery>, Promise<OrgsQuery>] => {
  const t = typeFilter("Team", type) ? teamsQuery(search, canton, game, language) : Promise.resolve<TeamsQuery>([]);
  const o = typeFilter("Organisation", type) ? orgsQuery(search, canton, language) : Promise.resolve<OrgsQuery>([]);
  const u = typeFilter("User", type) ? usersQuery(search, canton, game, language) : Promise.resolve<UsersQuery>([]);
  return [u, t, o];
};

const teamsQuery = (search?: string, canton?: string, game?: string, language?: string) => db.teams.findMany({
  take: 10,
  where: {
    AND: [
      { cantons: { name: { equals: canton } } },
      { games: { name: { equals: game } } },
      { languages: { some: { languages: { name: language } } } },
      {
        OR: [
          { name: query(search) },
          { short_name: query(search) }
        ]
      }
    ]
  },
  select: {
    image: true,
    name: true,
    short_name: true,
    games: {
      select: {
        name: true
      }
    }
  }
});

const orgsQuery = (search?: string, canton?: string, language?: string) => db.organisations.findMany({
  take: 10,
  where: {
    AND: [
      { cantons: { name: { equals: canton } } },
      { languages: { some: { languages: { name: language } } } },
      {
        OR: [
          { name: query(search) },
          { short_name: query(search) }
        ]
      }
    ]
  },
  select: {
    image: true,
    name: true,
    short_name: true
  }
});

const usersQuery = (search?: string, canton?: string, language?: string, game?: string) => db.users.findMany({
  take: 10,
  where: {
    AND: [
      { cantons: { name: { equals: canton } } },
      { user_languages: { some: { languages: { name: language } } } },
      { user_games: { some: { games: { name: game } } } },
      { nickname: query(search) }
    ],
  },
  select: {
    image: true,
    nickname: true,
    user_games: { select: { games: { select: { name: true } } } },
    team_members: { select: { teams: { select: { name: true } } } }
  }
});

export {
  searchQueries
};