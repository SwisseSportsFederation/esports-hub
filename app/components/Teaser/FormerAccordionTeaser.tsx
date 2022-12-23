import AccordionTeaser from "./AccordionTeaser";
import { useState } from "react";
// import DateInput from "../Form/DateInput";
import ActionButton from "../Button/ActionButton";
import type { FormerTeam } from "@prisma/client";
// import AutocompleteInput from "../Form/AutocompleteInput";

interface IFormerAccordionTeaserProps {
  onRemove: ((entity: FormerTeam) => void);
  onSave: ((entity: FormerTeam) => void);
  entity: FormerTeam;
  defaultExtended?: boolean;
}

const FormerAccordionTeaser = ({ onRemove, onSave, entity, defaultExtended = false }: IFormerAccordionTeaserProps) => {
  const [local, setEntity] = useState(entity);
  // const fromDateString = new Date(local.from).toISOString().split('T')[0];
  // const toDateString = new Date(local.to).toISOString().split('T')[0];

  // const setDate = (value: string, key: string) => {
  //   setEntity({
  //     ...local,
  //     [key]: new Date(value)
  //   });
  // };

  return <AccordionTeaser name={local.name} games={[]} defaultExtended={defaultExtended}>
    <div className='py-5 flex items-center flex-col space-y-6 w-full max-w-xl mx-auto'>
      {/*<AutocompleteInput value={local.name} onChange={(name: string) => setEntity({*/}
      {/*  ...local,*/}
      {/*  name*/}
      {/*})} endpoint='/search/formerTeams' label='Team Name' id={local.name} name={local.name}/>*/}
      {/*<DateInput label='From' value={fromDateString} max={new Date()} onChange={(value: string) => setDate(value, "from")} required={true}/>*/}
      {/*<DateInput label='To' min={local.from} max={new Date()} value={toDateString}*/}
      {/*           onChange={(value: string) => setDate(value, "to")} required={true}/>*/}
      <div className='flex flex-row w-full align-middle justify-center space-x-4'>
        <ActionButton content='Save' action={() => onSave(local)}/>
        <ActionButton content='Remove' action={() => onRemove(local)}/>
      </div>
    </div>
  </AccordionTeaser>;
};

export default FormerAccordionTeaser;
