import { Form, useSearchParams } from "@remix-run/react";
import ActionButton from "~/components/Button/ActionButton";
import TextInput from "~/components/Forms/TextInput";
import DropDownInput from "~/components/Forms/DropdownInput";
import type { IdValue } from "~/services/search.server";

type SearchBoxProps = ({
  games: IdValue[];
  cantons: IdValue[];
  languages: IdValue[];
  small?: boolean;
  forceWhiteText?: boolean;
} | {
  games?: never;
  cantons?: never;
  languages?: never;
  small?: never;
  forceWhiteText?: boolean;
});

const getIdValue = (values: IdValue[], query: string | null): IdValue | null => {
  if(query === null) {
    return null;
  }
  const gameId = values.findIndex(value => value.name === query);
  if(gameId < 0) {
    return null;
  }
  return {
    id: String(gameId + 1),
    name: query
  };
}

const SearchBox = ({ games = [], cantons = [], languages = [], small = false, forceWhiteText = false }: SearchBoxProps) => {
  const [params] = useSearchParams();
  const types: IdValue[] = [
    { name: "User", id: "User" },
    { name: "Team", id: "Team" },
    { name: "Organisation", id: "Organisation" }
  ];

  const game = getIdValue(games, params.get("game"));
  const canton = getIdValue(cantons, params.get("canton"));
  const language = getIdValue(languages, params.get("language"));
  const type = getIdValue(types, params.get("type"));
  const buttonTextColor = forceWhiteText ? "text-white" : "text-color";

  return (
    <Form method="get" action={'/search'} autoComplete={"on"}>
      <div className="max-w-sm md:max-w-lg">
        <TextInput id="search" label="Search" searchIcon={true}
                   buttonType="submit" defaultValue={params.get("search")}/>
      </div>
      <div className="pt-5 px-3 -mt-5 w-full max-w-sm md:max-w-lg">
        {!small &&
          <div className="relative">
            <div className="my-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <DropDownInput inputs={games} name="game" selected={game} search={true}/>
                <DropDownInput inputs={cantons} name="canton" selected={canton} search={true}/>
                <DropDownInput inputs={languages} name="language" selected={language} search={true}/>
                <DropDownInput inputs={types} name="type" selected={type} search={true}/>
              </div>
            </div>
          </div>
        }
        <div className="w-full pb-4">
          <ActionButton content="Search" type="submit" className={"mr-auto ml-auto"} buttonTextColor={buttonTextColor}/>
        </div>
      </div>
    </Form>
  );
};

export default SearchBox;
