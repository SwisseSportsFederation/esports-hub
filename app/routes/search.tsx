import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import SearchBox from "~/components/Forms/SearchBox";
import getCache from "~/services/cache.server";
import Teaser from "~/components/Teaser/Teaser";
import { searchQueries } from "~/db/queries.server";
import type { Game } from "@prisma/client";

type SearchResult = {
  users: UserSearchResult[],
  teams: UserSearchResult[],
  orgs: UserSearchResult[]
}

type UserSearchResult = {
  image?: string,
  name: string,
  team?: string,
  games: Game[]
};

type SearchParams = {
  games: string[],
  cantons: string[] | null,
  languages: string[] | null
};

type LoaderData = {
  searchResults: SearchResult | null,
  searchParams: SearchParams
};

const paramUndefined = (value: string | null) => (value === null || value === "All") ? undefined : value;

const searchForUsers = async (searchParams: URLSearchParams) => {
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
    games: [team.game] ?? []
  }));

  const orgs = orgsResult.map(org => ({
    image: org.image,
    name: org.name,
    team: org.short_name
  }));
  return { users, teams, orgs };
};


async function getSearchParams(): Promise<SearchParams> {
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

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchResults = await searchForUsers(url.searchParams);

  const searchParams = await getSearchParams();
  return json({
    searchResults,
    searchParams
  });
};

export default function() {
  const { searchResults, searchParams } = useLoaderData<LoaderData>();
  let resultsNode = null;
  if(searchResults) {
    const results = new Array<UserSearchResult>().concat(searchResults.teams, searchResults.orgs, searchResults.users);
    console.log(results);
    resultsNode = results.map((teaser: UserSearchResult, index: number) =>
      <Teaser key={index} name={teaser.name} team={teaser.team} games={teaser.games} avatarPath={teaser.image}/>
    );
  }
  return <div className="space-y-4 max-w-md w-full mx-auto">
    <SearchBox games={searchParams.games ?? []} cantons={searchParams.cantons ?? []}
               languages={searchParams.languages ?? []}/>

    {resultsNode && resultsNode}
  </div>;
}
