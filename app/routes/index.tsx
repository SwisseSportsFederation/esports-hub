import SearchBox from "~/components/Forms/SearchBox";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { SearchParams } from "~/services/search.server";
import { getSearchParams } from "~/services/search.server";

type LoaderData = {
  searchParams: SearchParams
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  return json({
    searchParams: await getSearchParams()
  });
};
export default function Index() {
  const { searchParams } = useLoaderData<LoaderData>();
  return <>
    <section className="flex items-center justify-center flex-col mx-3">
      <h2 className="text-xl lg:text-3xl font-bold">Search for Swiss Esports Actors</h2>
      <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []}
                languages={searchParams.languages ?? []}/>
    </section>
  </>;
}
