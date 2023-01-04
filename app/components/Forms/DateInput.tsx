import DatePicker from 'react-date-picker/dist/entry.nostyle'
import { useState } from 'react';

interface IDateInputProps {
  label: string;
  value: Date;
  min?: Date;
  max?: Date;
  required?: boolean;
}

const DateInput = ({ label, value: defaultValue, min, max, required = false }: IDateInputProps) => {
  const [value, onChange] = useState(defaultValue);

  return (
      <div className="w-full max-w-sm lg:max-w-full">
        <div className="relative mt-3">
          <span className={`absolute top-2 left-4 opacity-0 transition-all text-black dark:text-white`}>
            {label}
          </span>
          <DatePicker onChange={onChange} value={value} minDate={min} maxDate={max} required={required} locale="ch-DE" format="yyyy-MM-dd" />
        </div>
      </div>
  );
};

export default DateInput;
