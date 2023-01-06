import getCache from "~/services/cache.server";
import { db } from "~/services/db.server";
import { searchQueries } from "~/db/queries.server";
import type { Game } from "@prisma/client";
import { EntityType } from "~/helpers/entityType";

export type SearchParams = {
  games: string[],
  cantons: string[] | null,
  languages: string[] | null
};

export type UserSearchResult = {
  handle: string,
  image: string | null,
  name: string,
  team: string | null,
  games: Omit<Game, 'id'>[],
  type: EntityType,
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
    handle: user.handle,
    name: user.handle,
    image: user.image,
    team: user.teams.map(mem => mem.team.name)?.[0],
    games: user.games,
    type: 'USER' as EntityType
  }));

  const teams = teamsResult.map(team => ({
    handle: team.handle,
    image: team.image,
    name: team.name,
    team: team.handle,
    games: team.game ? [team.game] : [],
    type: 'TEAM' as EntityType
  }));

  const orgs = orgsResult.map(org => ({
    handle: org.handle,
    image: org.image,
    name: org.name,
    team: org.handle,
    games: [],
    type: 'ORG' as EntityType
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
