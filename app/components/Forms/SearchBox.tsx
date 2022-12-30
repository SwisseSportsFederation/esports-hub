import { Form, useSearchParams } from "@remix-run/react";
import ActionButton from "~/components/Button/ActionButton";
import TextInput from "~/components/Forms/TextInput";
import DropDownInput from "~/components/Forms/DropdownInput";

type SearchBoxProps = ({
  games: string[];
  cantons: string[];
  languages: string[];
  small?: boolean;
} | {
  games?: never;
  cantons?: never;
  languages?: never;
  small?: never;
});

const SearchBox = ({ games = [], cantons = [], languages = [], small = false }: SearchBoxProps) => {
  const [params] = useSearchParams();
  const types: string[] = ["User", "Team", "Organisation"];

  return (
    <Form method="get" action={'/search'} autoComplete={"on"}>
      <div className="max-w-sm md:max-w-lg">
        <TextInput id="search" label="Search" searchIcon={true}
                  buttonType="submit" defaultValue={params.get("search")}/>
      </div>
      <div className="pt-5 px-3 -mt-5 w-full max-w-sm md:max-w-lg">
        { !small && 
        <div className="">
          <div className="my-4">
            <div className="flex flex-wrap gap-4 overflow-visible md:justify-center">
              <DropDownInput inputs={games} name="game" selected={params.get("game")}/>
              <DropDownInput inputs={cantons} name="canton" selected={params.get("canton")}/>
              <DropDownInput inputs={languages} name="language" selected={params.get("language")}/>
              <DropDownInput inputs={types} name="type" selected={params.get("type")}/>
            </div>
          </div>
        </div>
        }
        <div className="w-full pb-4">
          <ActionButton content="Search" type="submit" className="mr-auto ml-auto"/>
        </div>
      </div>
    </Form>
  );
};

export default SearchBox;
