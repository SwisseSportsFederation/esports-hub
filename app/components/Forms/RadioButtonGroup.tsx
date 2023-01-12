interface IRadioButtonGroupProps {
  values: string[];
  id: string;
  selected: string;
}

function RadioButtonGroup({ values, id, selected }: IRadioButtonGroupProps) {
  return <ul className='flex flex-row w-full justify-around'>
    {
      values.map((value: string) => {
        return <li key={value}>
          <label>
            <input type={'radio'} name={id} defaultChecked={value.toUpperCase() === selected.toUpperCase()}
                   className='h-4 w-4 checked:bg-red-700' value={value}/>
            <span className='ml-2'>{value}</span>
          </label>
        </li>;
      })
    }
  </ul>;
}

export default RadioButtonGroup;
