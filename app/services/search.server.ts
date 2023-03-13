import getCache from "~/services/cache.server";
import { db } from "~/services/db.server";
import { searchQuery } from "~/db/queries.server";
import type { Game } from "@prisma/client";
import type { EntityType } from "~/helpers/entityType";

export type IdValue = { name: string, id: string };

export type SearchParams = {
  games: IdValue[],
  cantons: IdValue[],
  languages: IdValue[]
};

export type UserSearchResult = {
  id: string,
  handle: string,
  image: string | null,
  name: string,
  team: string | null,
  games: Omit<Game, 'id'>[],
  type: EntityType,
};

export type SearchResult = {
  results: UserSearchResult[],
}

const paramUndefined = (value: string | null) => (value === null || value === "All") ? undefined : value;

export async function searchForUsers(searchParams: URLSearchParams): Promise<SearchResult> {
  const search = paramUndefined(searchParams.get("search"));
  const canton = paramUndefined(searchParams.get("canton"));
  const game = paramUndefined(searchParams.get("game"));
  const language = paramUndefined(searchParams.get("language"));
  const type = paramUndefined(searchParams.get("type"));
  const offset = paramUndefined(searchParams.get("offset"));

  const query = searchQuery(search, canton, game, language, type, Number(offset ?? 0));

  const queryResults = await query;
  console.log("results ", queryResults);
  const results = queryResults.map(result => ({
    id: String(result.id),
    handle: result.handle,
    name: result.handle,
    image: result.image,
    team: result.team ? result.team : "",
    games: result.entity_type === 'ORG' ? [] : result.games,
    type: result.entity_type
  }));
  /*
  const users = usersResult.map(user => ({
    id: String(user.id),
    handle: user.handle,
    name: user.handle,
    image: user.image,
    team: user.teams.map(mem => mem.team.name)?.[0],
    games: user.games,
    type: 'USER' as EntityType
  }));

  const teams = teamsResult.map(team => ({
    id: String(team.id),
    handle: team.handle,
    image: team.image,
    name: team.name,
    team: team.handle,
    games: team.game ? [team.game] : [],
    type: 'TEAM' as EntityType
  }));

  const orgs = orgsResult.map(org => ({
    id: String(org.id),
    handle: org.handle,
    image: org.image,
    name: org.name,
    team: org.handle,
    games: [],
    type: 'ORG' as EntityType
  }));*/
  return { results };
}

export async function getSearchParams(): Promise<SearchParams> {
  const searchParams = getCache().get("searchParams");

  if(!searchParams) {
    const name = { select: { id: true, name: true } };
    const [cantons, games, languages] = await Promise.all([
      db.canton.findMany(name),
      db.game.findMany(name),
      db.language.findMany(name)
    ]);
    const mapper = (toMap: { name: string, id: bigint }) => ({ name: toMap.name, id: String(toMap.id) });

    const searchParams: SearchParams = {
      games: games.map(mapper),
      cantons: cantons.map(mapper),
      languages: languages.map(mapper)
    };
    getCache().set("searchParams", JSON.stringify(searchParams));
    return searchParams;
  }
  return JSON.parse(searchParams);
}
