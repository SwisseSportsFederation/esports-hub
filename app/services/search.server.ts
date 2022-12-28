import getCache from "~/services/cache.server";
import { db } from "~/services/db.server";
import { searchQueries } from "~/db/queries.server";
import type { Game } from "@prisma/client";

export type SearchParams = {
  games: string[],
  cantons: string[] | null,
  languages: string[] | null
};

export type UserSearchResult = {
  image: string | null,
  name: string,
  team: string | null,
  games: Omit<Game, 'id'>[]
};

export type SearchResult = {
  users: UserSearchResult[],
  teams: UserSearchResult[],
  orgs: UserSearchResult[]
}

const paramUndefined = (value: string | null) => (value === null || value === "All") ? undefined : value;

export async function searchForUsers(searchParams: URLSearchParams): Promise<SearchResult> {
  const search = paramUndefined(searchParams.get("search"));
  const canton = paramUndefined(searchParams.get("canton"));
  const game = paramUndefined(searchParams.get("game"));
  const language = paramUndefined(searchParams.get("language"));
  const type = paramUndefined(searchParams.get("type"));

  const queries = searchQueries(search, canton, game, language, type);

  const [usersResult, teamsResult, orgsResult] = await Promise.all(queries);

  const users = usersResult.map(user => ({
    name: user.nickname,
    image: user.image,
    team: user.teams.map(mem => mem.team.name)?.[0],
    games: user.games
  }));

  const teams = teamsResult.map(team => ({
    image: team.image,
    name: team.name,
    team: team.short_name,
    games: team.game ? [team.game] : []
  }));

  const orgs = orgsResult.map(org => ({
    image: org.image,
    name: org.name,
    team: org.short_name,
    games: []
  }));
  return { users, teams, orgs };
}

export async function getSearchParams(): Promise<SearchParams> {
  const searchParams = getCache().get("searchParams");

  if(!searchParams) {
    const name = { select: { name: true } };
    const [cantons, games, languages] = await Promise.all([
      db.canton.findMany(name),
      db.game.findMany(name),
      db.language.findMany(name)
    ]);

    const mapper = (arr: { name: string | null }[]) => {
      return arr.map(value => value.name ?? "").filter(value => value !== "");
    };

    const searchParams: SearchParams = {
      games: mapper(games),
      cantons: mapper(cantons),
      languages: mapper(languages)
    };
    getCache().set("searchParams", JSON.stringify(searchParams));
    return searchParams;
  }
  return JSON.parse(searchParams);
}
