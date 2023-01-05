import DatePicker from 'react-date-picker/dist/entry.nostyle'
import { useState } from 'react';

interface IDateInputProps {
  label: string;
  name: string;
  value: Date;
  min?: Date;
  max?: Date;
  required?: boolean;
}

const DateInput = ({ label, name, value: defaultValue, min, max, required = false }: IDateInputProps) => {
  const [value, onChange] = useState(defaultValue);

  return (
      <div className="w-full max-w-sm lg:max-w-full">
        <div className="relative mt-3">
          <label className={`absolute -top-5 left-4 text-xs text-black dark:text-white`} htmlFor={name}>
            {label}
          </label>
          <DatePicker onChange={onChange} name={name} value={value} minDate={min} maxDate={max} required={required} locale="ch-DE" format="yyyy-MM-dd" />
        </div>
      </div>
  );
};

export default DateInput;
