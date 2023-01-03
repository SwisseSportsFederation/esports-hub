import DropDownInput from "./DropdownInput";
import ActionBlock from "../Blocks/ActionBlock";

type ISimpleType = {
  id: number;
  name: string;
}

interface IDropDownAdderProps {
  name: string,
  label: string,
  values: string[],
  selectedValues: [],
  onAddItem?: ((item: ISimpleType) => void),
  onRemoveItem?: ((item: ISimpleType) => void),
}

/* TODO check if types work out like this and if this component works */

const DropDownAdder = (props: IDropDownAdderProps) => {
  const { name, label, values, selectedValues = [], onAddItem, onRemoveItem } = props;
  const selectableValues = values.filter((value) => !selectedValues.some((selectedValue) => selectedValue.id === value.id));
  const addItem = (itemId: string, item: any) => {
    item && onAddItem && onAddItem({
      id:  parseInt(item.id),
      name: item.text
    });
  };

  const removeItem = (item) => {
    onRemoveItem && onRemoveItem({
      id:  parseInt(item.id),
      name: item.text
    });
  };

  return (
    <>
      <div className="w-full max-w-sm lg:max-w-full">
        <label><span className={`absolute left-4 top-6 transition-all text-black`}>{label}</span></label>
        <DropDownInput name={name} inputs={selectableValues} selected={null}/>
          { selectedValues.map((value) =>
            <ActionBlock key={value.id} title={value.text} onAction={() => removeItem(value)} className="mt-4" />
          )}
        </div>
    </>
  );
};

export default DropDownAdder;
