import Icon from "~/components/Icon";
import { Form, useSearchParams } from "@remix-run/react";
import ActionButton from "~/components/Button/ActionButton";
import TextInput from "~/components/Forms/TextInput";
import DropDownInput from "~/components/Forms/DropdownInput";
import { CSSTransition } from 'react-transition-group';
import { useState } from "react";

type SearchBoxProps = ({
  games: string[];
  cantons: string[];
  languages: string[];
  small?: never;
} | {
  games?: never;
  cantons?: never;
  languages?: never;
  small: boolean;
});

const SearchBox = ({ games = [], cantons = [], languages = [], small = false }: SearchBoxProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [params] = useSearchParams();
  const types: string[] = ["User", "Team", "Organisation"];
  const filtersHTML = (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <DropDownInput inputs={games} name="game" selected={params.get("game")}/>
        <DropDownInput inputs={cantons} name="canton" selected={params.get("canton")}/>
        <DropDownInput inputs={languages} name="language" selected={params.get("language")}/>
        <DropDownInput inputs={types} name="type" selected={params.get("type")}/>
      </div>
      <div className="w-full pb-4">
        <ActionButton content="Search" type="submit" className="mr-auto ml-auto"/>
      </div>
    </>
  );

  return (
    <Form method="get" action={'/search'} autoComplete={"on"}>
      <TextInput id="search" label="Search" iconPath="/assets/search.svg"
                 buttonType="submit" defaultValue={params.get("search")}/>
      {!small && <div className="flex items-center flex-col">
        <CSSTransition
          in={isDropdownOpen}
          timeout={500}
          classNames={{
            enter: 'slide-y-enter',
            enterActive: 'slide-y-enter-active',
            enterDone: 'slide-y-enter-done',
            exit: 'slide-y-exit',
            exitActive: 'slide-y-exit-active'
          }}>
          <div className="bg-gray-6 dark:bg-gray-3 pt-5 px-3 -mt-5 rounded-b-[1.3rem] w-full overflow-hidden hidden">
            {filtersHTML}
          </div>
        </CSSTransition>
        <button className="h-5 w-24 bg-gray-6 dark:bg-gray-3 rounded-b-xl focus:outline-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button">
          <div className="max-w-full max-h-full flex items-center justify-center">
            <Icon path="/assets/arrow-down.svg"
                  className={`h-6 w-6 transition-transform transform dark:text-white text-black 
                  ${isDropdownOpen ? 'rotate-180' : ''}`}/>
          </div>
        </button>
      </div>}
    </Form>
  );
};

export default SearchBox;
