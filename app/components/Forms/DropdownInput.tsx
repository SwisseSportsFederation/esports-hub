import { Fragment, useState } from "react";
import { Listbox, Transition } from '@headlessui/react';
import Icon from "~/components/Icons";
import classNames from "classnames";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { IdValue } from "~/services/search.server";

type DropdownInputProps = {
  inputs: IdValue[],
  name: string,
  selected: IdValue | null,
  search?: boolean,
  isBig?: boolean,
  onChange?: Function,
  showSelected?: boolean,
  defaultOption?: IdValue,
  showDefaultOption?: boolean,
  sendDefaultOption?: boolean
}

const DropdownInput = (props: PropsWithClassName<DropdownInputProps>) => {
  const {
    inputs, name, selected, className, sendDefaultOption = true, showDefaultOption = true,
    onChange, search = false, isBig = false, showSelected = true, defaultOption = { id: 'All', name: 'All' }
  } = props;
  const [value, setValue] = useState(selected ?? defaultOption);

  const listBoxButton = classNames({
    "text-gray-4": value.name === "All" && showSelected,
    "text-black": value.name !== "All" || !showSelected,
    "h-10 text-md": isBig,
    "text-sm": !isBig
  }, "py-1 pl-3 pr-10 relative inline-flex items-center justify-between rounded-xl bg-white border" +
    "border-gray-300 w-full");
  const wrapperClasses = classNames({ "relative": !search }, className || "mt-1 inline-block")

  const onValueChange = (value: IdValue) => {
    setValue(value);
    onChange && onChange(value);
  }

  let labelText = name;
  if(value.name !== "All" && showSelected) {
    labelText = value.name;
  }

  return <>
    {(value.id !== defaultOption.id || sendDefaultOption) && <input type="hidden" name={name} value={value.id}/>}
    <Listbox value={value} onChange={onValueChange}>
      <div className={wrapperClasses}>
        <Listbox.Button className={listBoxButton}>
          <span className="whitespace-nowrap overflow-hidden capitalize">{labelText}</span>
          <Icon iconName='arrowDown' className="h-5 w-5 absolute right-2 mt-auto mb-auto z-[1]"/>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Listbox.Options
            className="origin-top-right absolute mt-2 w-56 max-h-56 rounded-md shadow-lg bg-white dark:bg-gray-2 ring-1 overflow-y-scroll
            ring-black ring-opacity-5 divide-y divide-gray-3 focus:outline-none z-20 right-0">
            {inputs.length > 0 &&
              <>
                {showDefaultOption && <div className="py-1">
                  <Listbox.Option value={defaultOption} className="block px-4 py-2 cursor-pointer text-sm text-gray-700 dark:text-white
                        dark:hover:bg-gray-3 hover:bg-gray-6 w-full h-9">
                    {defaultOption.name}
                  </Listbox.Option>
                </div>}
                <div className="py-1">
                  {inputs.map((input) => (
                    <Listbox.Option key={Number(input.id)} value={input} className="block px-4 py-2 cursor-pointer text-sm text-gray-700 dark:text-white
                        dark:hover:bg-gray-3 hover:bg-gray-6 w-full">
                      {input.name}
                    </Listbox.Option>
                  ))}
                </div>
              </>
            }
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  </>;
};


export default DropdownInput;
