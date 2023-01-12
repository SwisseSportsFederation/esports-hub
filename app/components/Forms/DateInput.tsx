import { useState } from 'react';
import Calendar from 'react-calendar';
import Modal from "~/components/Notifications/Modal";
import IconButton from "~/components/Button/IconButton";
import { dateToFormattedString } from "~/utils/dateHelper";

interface IDateInputProps {
  label: string;
  name: string;
  value: Date | null;
  min?: Date;
  max?: Date;
}

const DateInput = ({ label, name, value: defaultValue, min, max }: IDateInputProps) => {
  const [value, onChange] = useState<Date | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <div className="relative mt-3 z-20 w-full">
      <label className={`absolute text-xs -top-5 left-4 text-black dark:text-white`}>{label}</label>
      <div className={`text-black h-10 text-md px-4 cursor-pointer 
                       relative inline-flex items-center justify-between
                       rounded-xl bg-white borderborder-gray-300 w-full`}
           placeholder="Select date" onClick={() => setIsOpen(true)}>
        <span>{dateToFormattedString(value)}</span>
        <IconButton icon='remove' type='button' action={() => onChange(null)}/>
      </div>

      {value && <input type='hidden' name={name} value={value.toUTCString()}/>}
    </div>
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <Calendar onChange={(e: Date) => {
        onChange(e);
        setIsOpen(false);
      }} value={value} minDate={min} maxDate={max} locale="ch-DE" className='!w-full'/>
    </Modal>
  </>;
};

export default DateInput;