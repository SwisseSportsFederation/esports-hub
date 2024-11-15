import { useState } from 'react';
import Calendar from 'react-calendar';
import Modal from "~/components/Notifications/Modal";
import IconButton from "~/components/Button/IconButton";
import { toISODateString } from "~/utils/dateHelper";
import { PropsWithClassName } from '~/utils/PropsWithClassName';

interface IDateInputProps {
  label: string;
  name: string;
  value: Date | null;
  min?: Date;
  max?: Date;
  required?: boolean;
}

const DateInput = ({ label, name, value: defaultValue, min, max, required = false, className }: PropsWithClassName<IDateInputProps>) => {
  const [value, onChange] = useState<Date | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  return <>
    <div className={`relative mt-3 z-20 w-full max-w-sm lg:max-w-full ${className}`}>
      <label className={`absolute text-xs -top-5 left-4 text-color`}>{label}</label>
      <div className={`text-black h-10 text-md px-4 cursor-pointer 
                       relative inline-flex items-center justify-between
                       rounded-xl bg-white borderborder-gray-300 w-full`}>
        <input type="date" name={name}
          value={value ? toISODateString(value) : ""}
          onChange={(el) => onChange(new Date(el.target.value))}
          className="bg-transparent focus:ring-0 outline-none"
          required={required} />
        <div>
          {value && <IconButton icon='remove' type='button' className="text-red-600 mr-1" action={() => onChange(null)} />}
          <IconButton icon='date' type='button' action={() => setIsOpen(true)} />
        </div>
      </div>
    </div>
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <Calendar onChange={(e: Date) => {
        onChange(e);
        setIsOpen(false);
      }} value={value} minDate={min} maxDate={max} locale="ch-DE" className='!w-full' />
    </Modal>
  </>;
};

export default DateInput;
