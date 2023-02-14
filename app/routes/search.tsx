import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useFetcher } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { useState, useEffect } from "react";
import ActionButton from "~/components/Button/ActionButton";
import SearchBox from "~/components/Forms/SearchBox";
import LinkTeaser from "~/components/Teaser/LinkTeaser";
import type { UserSearchResult } from "~/services/search.server";
import { getSearchParams, searchForUsers } from "~/services/search.server";

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
  const [params] = useSearchParams();
  const fetcher = useFetcher();

  const [resultsNode, setResultsNode] = useState<JSX.Element[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [teams, setTeams] = useState<UserSearchResult[]>([]);
  const [orgs, setOrgs] = useState<UserSearchResult[]>([]);
  const [hasNext, setHasNext] = useState<Boolean>(false);

  useEffect(() => {
    if(fetcher.type === 'done') {
      setUsers([...users, ...fetcher.data.searchResults.users]);
      setTeams([...teams, ...fetcher.data.searchResults.teams]);
      setOrgs([...orgs, ...fetcher.data.searchResults.orgs]);

      setHasNext(fetcher.data.searchResults.users.length > 0 || fetcher.data.searchResults.teams.length > 0 || fetcher.data.searchResults.orgs.length > 0);

      const results = new Array<UserSearchResult>().concat(fetcher.data.searchResults.teams, fetcher.data.searchResults.orgs, fetcher.data.searchResults.users);
      setResultsNode([...resultsNode, ...results.map((teaser: UserSearchResult, index: number) =>
      <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
                  avatarPath={teaser.image} type={teaser.type} handle={teaser.handle}/>
                  )]);
    }
  }, [fetcher.data])

  useEffect(() => {
    setUsers(searchResults.users);
    setTeams(searchResults.teams);
    setOrgs(searchResults.orgs);

    setHasNext(searchResults.users.length > 0 || searchResults.teams.length > 0 || searchResults.orgs.length > 0);

    const results = new Array<UserSearchResult>().concat(searchResults.teams, searchResults.orgs, searchResults.users);
    setResultsNode([...results.map((teaser: UserSearchResult, index: number) =>
    <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
                avatarPath={teaser.image} type={teaser.type} handle={teaser.handle}/>
                )]);
  }, [])

  return <div className="max-w-md w-full mx-auto px-4 pt-8">
    <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []} languages={searchParams.languages ?? []}/>
    {resultsNode && resultsNode}
    {resultsNode && hasNext && <fetcher.Form method="get" action={'/search'}>
      <input type="hidden" name="game" value={params.get("game")!}/>
      <input type="hidden" name="canton" value={params.get("canton")!}/>
      <input type="hidden" name="language" value={params.get("language")!}/>
      <input type="hidden" name="type" value={params.get("type")!}/>
      <input type="hidden" name="search" value={params.get("search")!}/>
      <input type="hidden" name="offset-org" value={orgs.length ?? 0}/>
      <input type="hidden" name="offset-team" value={teams.length ?? 0}/>
      <input type="hidden" name="offset-user" value={users.length ?? 0}/>
      <ActionButton type="submit" content="Load more" />
    </fetcher.Form>}
  </div>;
}
