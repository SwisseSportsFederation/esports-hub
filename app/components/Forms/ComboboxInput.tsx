import { Combobox, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import type { IdValue } from "~/services/search.server";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import Icons from '../Icons';

type ComboboxProps = {
  inputs: IdValue[],
  name: string,
  selected: IdValue | null,
  search?: boolean,
  isBig?: boolean,
  onChange?: Function,
  showSelected?: boolean,
  defaultOption?: IdValue,
  showDefaultOption?: boolean,
  sendDefaultOption?: boolean,
  addNotFound?: boolean
}

const ComboboxInput = (props: PropsWithClassName<ComboboxProps>) => {
  const {
    inputs, name, selected, className,
    onChange, search = false, isBig = false, showSelected = true,
    addNotFound = true
  } = props;
  const [value, setValue] = useState(selected);
  const [query, setQuery] = useState('')

  const onValueChange = (value: IdValue) => {
    setValue(value);
    onChange && onChange(value);
  }

  let labelText = name;
  if (!!value && value.name !== "All" && showSelected) {
    labelText = value.name;
  }

  const filteredInputs =
    query === ''
      ? inputs
      : inputs.filter((input) =>
        input.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      )

  return (
    <div className="mt-2 w-72">
      <Combobox value={value} onChange={onValueChange}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={() => value !== null ? value.name : ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labelText}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Icons
                iconName='arrowDown'
                className="h-5 w-5 text-gray-400 transform rotate-180"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredInputs.length === 0 && query !== '' && !addNotFound && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              )}
              {filteredInputs.length === 0 && query !== '' ? (
                /* Add new value */
                <Combobox.Option
                  key={inputs.length}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={{ id: null, name: query }}
                >
                  {({ value, active }) => (
                    <>
                      <span
                        className={`block truncate ${value ? 'font-medium' : 'font-normal'
                          }`}
                      >
                        Add: {query}
                      </span>
                      {value ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                            }`}
                        >
                          <Icons iconName='add' className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ) : (
                filteredInputs.map((input) => (
                  /* Choose existing value */
                  <Combobox.Option
                    key={input.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={input}
                  >
                    {({ value, active }) => (
                      <>
                        <span
                          className={`block truncate ${value ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {input.name}
                        </span>
                        {value ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                              }`}
                          >
                            <Icons iconName='accept' className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}

export default ComboboxInput;
