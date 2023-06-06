import { Fragment } from "react";

import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import { HiCheck, HiChevronDown } from "react-icons/hi";

const CustomMenu = ({
  idKey,
  valueKey,
  options,
  value: selected,
  onChange
}: {
  idKey?: string;
  valueKey: string;
  value: Record<string, string | number>;
  options: Record<string, string | number>[];
  onChange: (option: any) => void;
}) => {
  const handleOptionChange = (option: Record<string, string | number>) => {
    onChange(option);
  };

  return (
    <Listbox value={selected[valueKey]}>
      {({ open }) => (
        <div className="relative w-fit">
          {/*<Listbox.Button className="relative right-0 cursor-default rounded-md bg-zinc-900 py-1.5 pl-3 pr-10 text-right text-white shadow-sm ring-1 ring-zinc-600 hover:ring-2 hover:ring-red-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 sm:text-sm sm:leading-6">*/}
          <Listbox.Button className="relative w-fit rounded-md bg-zinc-900 p-2 pr-10 text-xs ring-2 ring-zinc-600 duration-150 hover:bg-zinc-800 md:text-sm">
            <span className="block truncate capitalize">{selected[valueKey] ?? "None"}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
              <HiChevronDown size={20} className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/*<Listbox.Options className="absolute z-10 mt-1.5 max-h-56 w-fit overflow-auto rounded-md bg-zinc-900 py-1 text-base shadow-lg ring-1 ring-zinc-300 ring-opacity-5 focus:outline-none sm:text-sm">*/}
            <Listbox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-md bg-zinc-900 text-xs ring-1 ring-zinc-600 md:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  onClick={() => handleOptionChange(option)}
                  key={idKey ? option[idKey] : option[valueKey]}
                  className={({ active }) =>
                    classNames(
                      active ? "bg-zinc-800 text-gray-100" : "text-white",
                      "relative cursor-default select-none px-2 py-2 pr-9"
                    )
                  }
                  value={option[valueKey]}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <span
                          className={classNames(selected ? "font-semibold" : "font-normal", "ml-3  capitalize")}
                          style={{ marginRight: 12 }}
                        >
                          {option[valueKey]}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={classNames(
                            active ? "text-zinc-200" : "text-zinc-400",
                            "absolute inset-y-0 right-0 flex items-center"
                          )}
                          style={{ paddingRight: 4 }}
                        >
                          <HiCheck size={20} className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

export default CustomMenu;
