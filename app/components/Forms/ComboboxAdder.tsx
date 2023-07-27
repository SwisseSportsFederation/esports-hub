import ActionBlock from "../Blocks/ActionBlock";
import { useState } from "react";
import type { IdValue } from "~/services/search.server";
import ComboboxInput from "./ComboboxInput";
import classNames from "classnames";

interface IComboboxAdderProps {
  name: string,
  label: string,
  values: IdValue[],
  defaultValues: IdValue[],
  onChange?: Function,
}

const ComboboxAdder = (props: IComboboxAdderProps) => {
  const { name, label, values, defaultValues = [], onChange } = props;
  let [selectableValues, setSelectableValues] = useState(values.filter((value) => !defaultValues.some((defaultValue) => defaultValue.id === value.id)))
  let [selectedValues, setSelectedValues] = useState(defaultValues);

  const addItem = (element: IdValue) => {
    if (selectedValues.includes(element)) {
      return;
    }
    if (element && element.name !== "All") {
      setSelectedValues([
        ...selectedValues,
        element
      ]);
      setSelectableValues(selectableValues.filter(item => item.name !== element.name));
    } else if (element.name === 'All') {
      setSelectedValues(values);
      setSelectableValues([]);
    }
    onChange && onChange(element);
  };

  const removeItem = (element: IdValue) => {
    if (element) {
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
    <div className="w-full max-w-sm lg:max-w-full relative">
      <label>
        <span className={`text-xs mb-4 text-color`}>{label}</span>
      </label>
      <ComboboxInput name={label} inputs={selectableValues} selected={null} isBig={true} className="mt-1 block"
        onChange={addItem} showSelected={false} />
      {selectedValues.map((value, index) => {
        const blockstyling = classNames({
          'opacity-30': value.id === null
        }, 'mt-4 !rounded-xl');
        return <ActionBlock key={`action-${index}`} title={value.name} onAction={() => removeItem(value)} className={blockstyling} />
      })}
      <input type='hidden' name={name} value={JSON.stringify(selectedValues.map(value => value.id))} />
    </div>
  </>
};

export default ComboboxAdder;
