import { Form, useSearchParams } from "@remix-run/react";
import classNames from "classnames";
import React from "react";
import ActionButton from "~/components/Button/ActionButton";
import DropDownInput from "~/components/Forms/DropdownInput";
import TextInput from "~/components/Forms/TextInput";
import type { IdValue } from "~/services/search.server";
import IconButton from "../Button/IconButton";

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
  if (query === null) {
    return null;
  }
  const gameId = values.findIndex(value => value.name === query);
  if (gameId < 0) {
    return null;
  }
  return {
    id: String(gameId + 1),
    name: query
  };
}

const SearchBox = ({ games = [], cantons = [], languages = [], small = false }: SearchBoxProps) => {
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
  const buttonTextColor = "text-white";
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);

  const filterClassNames = classNames({
    'hidden': !showFiltersMobile
  }, 'my-2 lg:block lg:my-4')

  return (
    <Form method="get" action={'/search'} autoComplete={"on"}>
      <div className="max-w-sm md:max-w-lg mx-auto flex align-middle">
        <TextInput id="search" label="Search" searchIcon={true} className={buttonTextColor}
          buttonType="submit" defaultValue={params.get("search")} />
        <IconButton icon="arrowDown" type="button"
          className={`${showFiltersMobile ? 'rotate-180' : ''} mt-3 ml-2 lg:hidden bg-gray-400 transition-transform`}
          action={() => setShowFiltersMobile(!showFiltersMobile)} />
      </div>
      <div className="pt-5 -mt-5 w-full mx-auto">
        {!small &&
          <div className="relative">
            <div className={filterClassNames}>
              <div className="block mt-4 lg:flex lg:gap-2 overflow-x-auto lg:justify-center">
                <DropDownInput inputs={games} name="game" selected={game} search={true} className="block mb-4" />
                <DropDownInput inputs={cantons} name="canton" selected={canton} search={true} className="block mb-4" />
                <DropDownInput inputs={languages} name="language" selected={language} search={true} className="block mb-4" />
                <DropDownInput inputs={types} name="type" selected={type} search={true} className="block mb-4" />
              </div>
            </div>
          </div>
        }
        <div className="w-full mt-4 pb-4">
          <ActionButton content="Search" type="submit" className={"mr-auto ml-auto"} buttonTextColor={buttonTextColor} />
        </div>
      </div>
    </Form>
  );
};

export default SearchBox;
