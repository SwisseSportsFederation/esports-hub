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
  const maxLoadEntity = 5;

  const [resultsNode, setResultsNode] = useState<JSX.Element[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [teams, setTeams] = useState<UserSearchResult[]>([]);
  const [orgs, setOrgs] = useState<UserSearchResult[]>([]);
  const [hasNext, setHasNext] = useState<Boolean>(false);

  const resultList = (userList: UserSearchResult[], teamList: UserSearchResult[], orgList: UserSearchResult[]) => {
    setUsers([...users, ...userList]);
    setTeams([...teams, ...teamList]);
    setOrgs([...orgs, ...orgList]);
  
    setHasNext(userList.length >= maxLoadEntity || teamList.length >= maxLoadEntity || orgList.length >= maxLoadEntity);
  
    const results = new Array<UserSearchResult>().concat(teamList, orgList, userList);
    return [...resultsNode, ...results.map((teaser: UserSearchResult, index: number) => 
                <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
                avatarPath={teaser.image} type={teaser.type} handle={teaser.handle}/>
                )];
  }

  useEffect(() => {
    if(fetcher.type === 'done') {
      setResultsNode(resultList(fetcher.data.searchResults.users, fetcher.data.searchResults.teams, fetcher.data.searchResults.orgs));
    }
  }, [fetcher.data])

  useEffect(() => {
    setResultsNode(resultList(searchResults.users, searchResults.teams, searchResults.orgs));
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
