import { json, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
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

export default function () {
  const { searchResults, searchParams } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const fetcher = useFetcher();
  const maxLoadEntity = 15;

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [hasNext, setHasNext] = useState<Boolean>(false);

  const checkHasNext = (results: UserSearchResult[]) => {
    setHasNext(results.length >= maxLoadEntity);
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data != null) {
      const newResults = fetcher.data.searchResults.results;
      checkHasNext(newResults);
      setResults([...results, ...newResults]);
    }
  }, [fetcher.data])

  useEffect(() => {
    checkHasNext(searchResults.results);
    setResults([...searchResults.results]);
  }, [searchParams])

  return <div className="w-full px-4 pt-8">
    <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []}
      languages={searchParams.languages ?? []} />
    <div className="max-w-md lg:max-w-lg mx-auto">
      {results && results.map((teaser: UserSearchResult, index: number) =>
        <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
          avatarPath={teaser.image} type={teaser.type} handle={teaser.handle} />
      )}
    </div>
    {results && hasNext && <fetcher.Form method="get" action={'/search'} className="flex justify-center pt-4">
      <input type="hidden" name="game" value={params.get("game")!} />
      <input type="hidden" name="canton" value={params.get("canton")!} />
      <input type="hidden" name="language" value={params.get("language")!} />
      <input type="hidden" name="type" value={params.get("type")!} />
      <input type="hidden" name="search" value={params.get("search")!} />
      <input type="hidden" name="offset" value={results.length ?? 0} />
      <ActionButton type="submit" content="Load more" />
    </fetcher.Form>}
    {results && results.length === 0 && <div className="text-center mt-4">No results found</div>}
  </div>;
}
