import Icon from "../Icons";
import classNames from "classnames";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";

interface ITextInputProps {
  id: string,
  label: string,
  searchIcon?: boolean,
  buttonType?: 'submit' | 'button',
  inputType?: "email" | "password" | "text"
  required?: boolean,
  defaultValue: string | null,
  disabled?: boolean,
  inputClassName?: string,
  placeholder?: string
}

const TextInput = (props: PropsWithClassName<ITextInputProps>) => {
  const {
    id,
    label,
    searchIcon = false,
    buttonType = 'button',
    required = false,
    inputType = 'text',
    className = '',
    inputClassName = '',
    defaultValue,
    disabled = false,
    placeholder
  } = props;
  const inputIconPadding = classNames({
    'pr-14': searchIcon
  }, inputClassName);
  
  const labelClasses = classNames({
    'has-placeholder': !!placeholder
  }, `absolute left-4 top-2 transition-all capitalize`)

  return (
    <div className={`relative mt-3 z-20 w-full max-w-sm lg:max-w-full ${className}`}>
      <label>
        <input type={inputType} name={id} required={required} placeholder={placeholder || " "} defaultValue={defaultValue ?? ""}
               disabled={disabled}
               className={`bg-white rounded-xl w-full h-10 px-4 text-black focus:outline-none border border-gray-6 dark:border-white ${inputIconPadding}`}/>
        <span className={labelClasses}>{label.toLowerCase()}</span>
      </label>
      {searchIcon &&
        <>
          <div className="absolute top-1/2 transform -translate-y-1/2 right-4 w-5 h-5 flex-none flex-end z-10">
            <button type={buttonType} className="focus:outline-none">
              <Icon iconName='search' className="h-5 w-5"/>
            </button>
          </div>
          <div className="absolute right-0 top-0 bg-gradient-to-l w-20 h-full
        dark:via-white dark:from-white from-white via-white rounded-r-full"/>
        </>
      }
    </div>
  );
};

export default TextInput;
