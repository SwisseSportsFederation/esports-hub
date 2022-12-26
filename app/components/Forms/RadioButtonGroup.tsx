export interface RadioButtonValue {
  name: string;
  id: number;
}

interface IRadioButtonGroupProps {
  values: RadioButtonValue[];
  onChange: ((value: RadioButtonValue) => void);
  id: string;
  selected: number;
}

function RadioButtonGroup({ values, onChange, id, selected }: IRadioButtonGroupProps) {
  return <ul className='flex flex-row w-full justify-around'>
    {
      values.map((value: RadioButtonValue, index: number) => {
        return <li key={index}>
          <label>
            <input type={'radio'} name={`radioButtonGroup${id}`} value={value.name}
                   onChange={() => onChange(value)} checked={value.id === selected} className='h-4 w-4'/>
            <span className='ml-2'>{value.name}</span>
          </label>
        </li>;
      })
    }
  </ul>;
}

export default RadioButtonGroup;
