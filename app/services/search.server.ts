import type { Game } from "@prisma/client";
import { EntityType } from "@prisma/client";
import { searchQuery } from "~/db/queries.server";
import getCache from "~/services/cache.server";
import { db } from "~/services/db.server";

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
  const results = queryResults.map(result => ({
    id: String(result.id),
    handle: result.handle,
    name: result.handle,
    image: result.image,
    team: result.team ? result.team : "",
    games: result.games.filter((game: string) => !!game).map((game: string) => { return { id: 0, name: game } }),
    type: result.entity_type
  }));
  return { results };
}

export async function
  getSearchParams(): Promise<SearchParams> {
  const searchParams = getCache().get("searchParams");

  if (!searchParams) {
    const filter = { select: { id: true, name: true } };
    const [cantons, languages] = await Promise.all([
      db.canton.findMany(filter),
      db.language.findMany(filter)
    ]);
    const mapper = (toMap: { name: string, id: bigint }) => ({ name: toMap.name, id: String(toMap.id) });

    const searchParams: SearchParams = {
      games: await getActiveGames(),
      cantons: cantons.map(mapper),
      languages: languages.map(mapper)
    };
    getCache().set("searchParams", JSON.stringify(searchParams));
    return searchParams;
  }
  return JSON.parse(searchParams);
}

export async function getActiveGames(): Promise<IdValue[]> {
  const filterGame = { where: { is_active: true }, select: { id: true, name: true } };
  const mapper = (toMap: { name: string, id: bigint }) => ({ name: toMap.name, id: String(toMap.id) });
  const games = await Promise.resolve(db.game.findMany(filterGame));
  return games.map(mapper).sort((a, b) => a.name.localeCompare(b.name));
}
