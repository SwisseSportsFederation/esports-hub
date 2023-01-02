import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import SearchBox from "~/components/Forms/SearchBox";
import Teaser from "~/components/Teaser/Teaser";
import type { SearchParams, SearchResult, UserSearchResult } from "~/services/search.server";
import { getSearchParams, searchForUsers } from "~/services/search.server";

type LoaderData = {
  searchResults: SearchResult | null,
  searchParams: SearchParams
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  return json({
    searchResults: await searchForUsers(url.searchParams),
    searchParams: await getSearchParams()
  });
};

export default function() {
  const { searchResults, searchParams } = useLoaderData<LoaderData>();

  let resultsNode = null;
  if(searchResults) {
    const results = new Array<UserSearchResult>().concat(searchResults.teams, searchResults.orgs, searchResults.users);
    resultsNode = results.map((teaser: UserSearchResult, index: number) =>
      <Teaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games} avatarPath={teaser.image} type={teaser.type}/>
    );
  }
  return <div className="max-w-md w-full mx-auto px-4">
    <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []}
               languages={searchParams.languages ?? []}/>

    {resultsNode && resultsNode}
  </div>;
}
