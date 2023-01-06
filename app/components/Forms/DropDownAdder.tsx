import DropDownInput from "./DropdownInput";
import ActionBlock from "../Blocks/ActionBlock";
import { useState } from "react";

interface IDropDownAdderProps {
  name: string,
  label: string,
  values: string[],
  defaultValues: string[]
}

const DropDownAdder = (props: IDropDownAdderProps) => {
  const { name, label, values, defaultValues = []} = props;
  let [selectableValues, setSelectableValues] = useState(values.filter((value) => !defaultValues.some((defaultValue) => defaultValue === value)))
  let [selectedValues, setSelectedValues] = useState(defaultValues);

  const addItem = (element: string) => {
    if(element && element !== "All") { 
      setSelectedValues([
        ...selectedValues,
        element
      ])
      setSelectableValues(selectableValues.filter(item => item !== element));
      const checkbox: HTMLInputElement | null = document.getElementById(`${name}-${element}`) as HTMLInputElement;
      checkbox.checked = true;
    }
  };

  const removeItem = (element: string) => {
    if(element) {
      setSelectedValues(
        selectedValues.filter(val =>
        val !== element
      ))
      setSelectableValues([
        ...selectableValues,
        element
      ]);
      const checkbox: HTMLInputElement | null = document.getElementById(`${name}-${element}`) as HTMLInputElement;
      checkbox.checked = false;
    }
  };

  return <>
    <div className="w-full">
      <label><span className={`absolute left-4 top-6 transition-all text-black`}>{label}</span></label>
      <DropDownInput name={label} inputs={selectableValues} selected={null} isBig={true} className="mt-1 block" onChange={addItem}/>
      { selectedValues.map((value, index) => <>
        <ActionBlock key={`action-${index}`} title={value} onAction={() => removeItem(value)} className="mt-4" />
        <input key={`input-${index}`} type="checkbox" name={name} id={`${name}-${value}`} value={value} className="hidden" checked readOnly/>
      </>
      )}
    </div>
  </>
};

export default DropDownAdder;
