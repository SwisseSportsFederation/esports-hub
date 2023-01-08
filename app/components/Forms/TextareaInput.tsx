import { useState } from "react";
import classNames from "classnames";

interface ITextareaInputProps {
  id: string,
  label: string,
  value: string
  required?: boolean,
}

const TextareaInput = (props: ITextareaInputProps) => {
  const {
    id,
    label,
    value,
    required = false
  } = props;
  const [check, setCheck] = useState(false);

  const handleBlur = () => {
    setCheck(value.length > 0);
  };
  const handleFocus = () => {
    setCheck(false);
  };

  const labelInvalid = classNames({
    'is-dirty': check,
    'dark:text-white': !!value
  });

  return (
    <div className="w-full max-w-sm lg:max-w-full relative">
      <label>
      <textarea name={id} defaultValue={value} required={required} placeholder=" "
                onBlur={handleBlur} onFocus={handleFocus}
                className={`bg-white rounded-xl h-48 min-h-[150px] w-full mt-3 px-4 py-3 text-black focus:outline-none border border-gray-6 dark:border-white resize-y`}/>
        <span className={`absolute left-4 top-6 transition-all text-black ${labelInvalid}`}>{label}</span>
      </label>
    </div>
  );
};

export default TextareaInput;
