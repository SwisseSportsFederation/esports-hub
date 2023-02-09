import { json } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import SearchBox from "~/components/Forms/SearchBox";
import LinkTeaser from "~/components/Teaser/LinkTeaser";
import type { UserSearchResult } from "~/services/search.server";
import { getSearchParams, searchForUsers } from "~/services/search.server";
import type { LoaderFunctionArgs } from "@remix-run/router";
import ActionButton from "~/components/Button/ActionButton";

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

  let resultsNode = null;
  let offset = Number(params.get("offset")) || 0;
  if(searchResults) {
    const results = new Array<UserSearchResult>().concat(searchResults.teams, searchResults.orgs, searchResults.users);
    resultsNode = results.map((teaser: UserSearchResult, index: number) =>
      <LinkTeaser key={index} id={teaser.id} name={teaser.name} team={teaser.team} games={teaser.games}
                  avatarPath={teaser.image} type={teaser.type} handle={teaser.handle}/>
    );
  }
  return <div className="max-w-md w-full mx-auto px-4 pt-8">
    <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []} languages={searchParams.languages ?? []}/>
    {resultsNode && resultsNode}
    {resultsNode && <Form method="get" action={'/search'} autoComplete={"on"}>
      <input type="hidden" name="game" value={params.get("game")!}/>
      <input type="hidden" name="canton" value={params.get("canton")!}/>
      <input type="hidden" name="language" value={params.get("language")!}/>
      <input type="hidden" name="type" value={params.get("type")!}/>
      <input type="hidden" name="search" value={params.get("search")!}/>
      <ActionButton type="submit" name="offset" value={"" + (offset+20)} content="Load more" />
    </Form>}
  </div>;
}
