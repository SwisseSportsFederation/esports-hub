import DropDownInput from "./DropdownInput";
import ActionBlock from "../Blocks/ActionBlock";
import { useState } from "react";
import type { IdValue } from "~/services/search.server";

interface IDropDownAdderProps {
  name: string,
  label: string,
  values: IdValue[],
  defaultValues: IdValue[]
}

const DropDownAdder = (props: IDropDownAdderProps) => {
  const { name, label, values, defaultValues = [] } = props;
  let [selectableValues, setSelectableValues] = useState(values.filter((value) => !defaultValues.some((defaultValue) => defaultValue.id === value.id)))
  let [selectedValues, setSelectedValues] = useState(defaultValues);

  const addItem = (element: IdValue) => {
    if(element && element.name !== "All") {
      setSelectedValues([
        ...selectedValues,
        element
      ]);
      setSelectableValues(selectableValues.filter(item => item.name !== element.name));
    } else if(element.name === 'All') {
      setSelectedValues(values);
      setSelectableValues([]);
    }
  };

  const removeItem = (element: IdValue) => {
    if(element) {
      setSelectedValues(
        selectedValues.filter(val =>
          val.id !== element.id
        ))
      setSelectableValues([
        ...selectableValues,
        element
      ]);
    }
  };

  return <>
    <div className="w-full">
      <label>
        <span className={`absolute left-4 top-6 transition-all text-color`}>{label}</span>
      </label>
      <DropDownInput name={label} inputs={selectableValues} selected={null} isBig={true} className="mt-1 block"
                     onChange={addItem} showSelected={false}/>
      {selectedValues.map((value, index) =>
        <ActionBlock key={`action-${index}`} title={value.name} onAction={() => removeItem(value)} className="mt-4"/>
      )}
      <input type='hidden' name={name} value={JSON.stringify(selectedValues.map(value => value.id))}/>
    </div>
  </>
};

export default DropDownAdder;
