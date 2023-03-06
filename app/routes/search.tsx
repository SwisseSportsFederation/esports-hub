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

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [teams, setTeams] = useState<UserSearchResult[]>([]);
  const [orgs, setOrgs] = useState<UserSearchResult[]>([]);
  const [hasNext, setHasNext] = useState<Boolean>(false);

  const checkHasNext = (userList: UserSearchResult[], teamList: UserSearchResult[], orgList: UserSearchResult[]) => {
    setHasNext(userList.length >= maxLoadEntity || teamList.length >= maxLoadEntity || orgList.length >= maxLoadEntity);
  }

  const setEntities = (userList: UserSearchResult[], teamList: UserSearchResult[], orgList: UserSearchResult[]) => {
    setUsers([...userList]);
    setTeams([...teamList]);
    setOrgs([...orgList]);
  
    const newResults = new Array<UserSearchResult>().concat(teamList, orgList, userList);
    return [...newResults];
  }

  useEffect(() => {
    if(fetcher.type === 'done') {
      const userList = fetcher.data.searchResults.users;
      const teamList = fetcher.data.searchResults.teams;
      const orgList = fetcher.data.searchResults.orgs;
      checkHasNext(userList, teamList, orgList);
      setEntities([...users, ...userList], [...teams, ...teamList], [...orgs, ...orgList]);
      const newResults = new Array<UserSearchResult>().concat(teamList, orgList, userList);
      setResults([...results, ...newResults]);
    }
  }, [fetcher.data])

  useEffect(() => {
    checkHasNext(searchResults.users, searchResults.teams, searchResults.orgs);
    setEntities(searchResults.users, searchResults.teams, searchResults.orgs);
    const newResults = new Array<UserSearchResult>().concat(searchResults.teams, searchResults.orgs, searchResults.users);
    setResults([...newResults]);
  }, [searchParams])

  return <div className="max-w-md w-full mx-auto px-4 pt-8">
    <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []}
               languages={searchParams.languages ?? []}/>

    {results && results.map((teaser: UserSearchResult, index: number) => 
                <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
                avatarPath={teaser.image} type={teaser.type} handle={teaser.handle}/>
                )}
    {results && hasNext && <fetcher.Form method="get" action={'/search'} className="flex justify-center pt-4">
      <input type="hidden" name="game" value={params.get("game")!}/>
      <input type="hidden" name="canton" value={params.get("canton")!}/>
      <input type="hidden" name="language" value={params.get("language")!}/>
      <input type="hidden" name="type" value={params.get("type")!}/>
      <input type="hidden" name="search" value={params.get("search")!}/>
      <input type="hidden" name="offset-org" value={orgs.length ?? 0}/>
      <input type="hidden" name="offset-team" value={teams.length ?? 0}/>
      <input type="hidden" name="offset-user" value={users.length ?? 0}/>
      <ActionButton type="submit" content="Load more"/>
    </fetcher.Form>}
  </div>;
}
