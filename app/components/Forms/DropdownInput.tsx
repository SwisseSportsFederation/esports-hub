import { Fragment, useState } from "react";
import { Listbox, Transition } from '@headlessui/react';
import Icon from "~/components/Icons";
import classNames from "classnames";

type DropdownInputProps = {
  inputs: string[],
  name: string,
  selected: string | null
}

const DropdownInput = ({ inputs, name, selected }: DropdownInputProps) => {
  const [value, setValue] = useState(selected ?? "All");
  const listBoxButton = classNames({
    "text-gray-4": value === "All",
    "text-black": value !== "All"
  }, "py-1 pl-3 pr-10 text-sm relative inline-flex items-center justify-between w-full rounded-full bg-white border" +
    "border-gray-300");

  return <>
    <input type="hidden" name={name} value={value ?? "All"}/>
    <Listbox value={value} onChange={setValue}>
      <div className="relative mt-1">
        <Listbox.Button
          className={listBoxButton}>
          <span className="whitespace-nowrap overflow-hidden">{value === "All" ? name.charAt(0).toUpperCase() + name.slice(1) : value}</span>
          <Icon iconName='arrowDown' className="h-5 w-5 absolute right-2 mt-auto mb-auto z-[1]"/>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Listbox.Options
            className="origin-top-right absolute right-0 mt-2 w-56 max-h-56 rounded-md shadow-lg bg-white dark:bg-gray-2
            ring-1 overflow-y-scroll ring-black ring-opacity-5 divide-y divide-gray-3 focus:outline-none z-20">
            <div className="py-1">
              <Listbox.Option value="All" className="block px-4 py-2 cursor-pointer text-sm text-gray-700 dark:text-white
                        dark:hover:bg-gray-3 hover:bg-gray-6 w-full">
                All
              </Listbox.Option>
            </div>
            <div className="py-1">
              {inputs.map((input) => (
                <Listbox.Option key={input} value={input} className="block px-4 py-2 cursor-pointer text-sm text-gray-700 dark:text-white
                        dark:hover:bg-gray-3 hover:bg-gray-6 w-full">
                  {input}
                </Listbox.Option>
              ))}
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  </>;
};


export default DropdownInput;
