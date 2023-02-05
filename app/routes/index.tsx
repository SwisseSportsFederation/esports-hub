import SearchBox from "~/components/Forms/SearchBox";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSearchParams } from "~/services/search.server";
import Background from "~/components/Background";

export async function loader() {
  return json({
    searchParams: await getSearchParams()
  });
}

export default function Index() {
  const { searchParams } = useLoaderData<typeof loader>();
  return <>
    <section className="flex items-center justify-center flex-col px-3 h-full z-10 flex-1">
      <h2 className="text-xl lg:text-3xl font-bold mb-4">Search for Swiss Esports Actors</h2>
      <div className="max-w-full">
        <SearchBox games={searchParams.games} cantons={searchParams.cantons ?? []}
                   languages={searchParams.languages ?? []}/>
      </div>
    </section>
    <Background/>
  </>;
}
