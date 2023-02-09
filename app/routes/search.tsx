import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import SearchBox from "~/components/Forms/SearchBox";
import LinkTeaser from "~/components/Teaser/LinkTeaser";
import type { UserSearchResult } from "~/services/search.server";
import { getSearchParams, searchForUsers } from "~/services/search.server";
import type { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const [searchResults, searchParams] = await Promise.all([searchForUsers(url.searchParams), getSearchParams()])

  return json({
    searchResults,
    searchParams
  });
}

export default function() {
  const { searchResults, searchParams } = useLoaderData<typeof loader>();

  let resultsNode = null;
  if(searchResults) {
    const results = new Array<UserSearchResult>().concat(searchResults.teams, searchResults.orgs, searchResults.users);
    resultsNode = results.map((teaser: UserSearchResult, index: number) =>
      <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
                  avatarPath={teaser.image} type={teaser.type} handle={teaser.handle}/>
    );
  }
  return <div className="max-w-md w-full mx-auto px-4 pt-8">
    <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []}
               languages={searchParams.languages ?? []}/>

    {resultsNode && resultsNode}
  </div>;
}
