import SearchBox from "~/components/Forms/SearchBox";
import { defer } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import { getSearchParams, SearchParams } from "~/services/search.server";
import Background from "~/components/Background";
import { useEffect, useState } from "react";

export async function loader() {
  return defer({
    searchParams: getSearchParams()
  });
}

export default function Index() {
  const { searchParams } = useLoaderData<typeof loader>();
  const [params, setParams] = useState<SearchParams>({
    games: [],
    cantons: [],
    languages: []
  });
  useEffect(() => {
    searchParams.then((params) => {
      setParams({ ...params });
    })
  }, [searchParams]);

  const textColor = "text-white";
  return <>
    <section className="flex items-center justify-center flex-col px-3 h-full z-10 flex-1">
      <h2 className={textColor + " text-xl lg:text-3xl font-bold mb-4"}>Search for Swiss Esports Members</h2>
      <div className="max-w-full">
        <SearchBox games={params.games}
                   cantons={params.cantons}
                   languages={params.languages}
                   forceWhiteText={true}/>
      </div>
    </section>
    <Background/>
  </>;
}
