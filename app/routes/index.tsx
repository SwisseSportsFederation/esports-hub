import SearchBox from "~/components/Forms/SearchBox";

export default function Index() {
  return <>
    <section className="flex items-center justify-center flex-col mx-3">
      <h2 className="text-xl lg:text-3xl font-bold">Search for Swiss Esports Actors</h2>
      <SearchBox small={false}/>
    </section>
  </>;
}
