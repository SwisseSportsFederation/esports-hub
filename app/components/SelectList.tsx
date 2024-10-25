import type { IconType } from "./Icons";
import Icons from "./Icons";
import IconButton from "./Button/IconButton";
import { useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import type { SocialPlatform } from "@prisma/client";

type ISelectListItemProps = {
  onClick: () => void
} & ISelectListValue;

export type ISelectListValue = {
  icon: IconType;
  title: string;
}

interface ISelectListProps {
  values: SocialPlatform[];
  showButton: boolean;
  onSelect: (selected: SocialPlatform) => void;
}

const SelectListItem = ({ icon, title, onClick }: ISelectListItemProps) => {
  return <li
    className='flex p-5 border-b border-gray-300 dark:border-black cursor-pointer hover:text-red-1 transition-colors capitalize'
    onClick={onClick}>
    <Icons iconName={icon} className='w-8 h-8 mr-5' />
    {title.toLowerCase()}
  </li>;
};

const SelectList = ({ values, onSelect, showButton }: ISelectListProps) => {
  const [visible, setVisible] = useState(false);
  const nodeRef = useRef(null);

  return <>
    {values.length > 0 && showButton &&
      <IconButton icon='add' action={() => setVisible(true)} size='medium' type='button' />}
    <CSSTransition
      in={visible}
      timeout={200}
      classNames={{
        enter: 'select-list-enter',
        enterActive: 'select-list-enter-active',
        enterDone: 'select-list-enter-done',
        exit: 'select-list-exit',
        exitActive: 'select-list-exit-active'
      }}
      nodeRef={nodeRef}
    >
      <div className="fixed w-full h-full left-0 bottom-0 bg-black z-[51] bg-opacity-25 overflow-hidden hidden"
        onClick={() => setVisible(false)} ref={nodeRef}>
        <div className="absolute bottom-0 bg-white dark:bg-gray-2 w-full rounded-t-2xl text-2xl px-5 pb-20 transform
            lg:w-1/2 lg:!translate-y-1/2 lg:bottom-1/2 lg:rounded-2xl lg:pb-0 lg:!-translate-x-1/2 lg:left-1/2 max-h-screen overflow-y-scroll">
          <div className="relative pt-4">
            <IconButton icon='remove' action={() => setVisible(false)} size='medium' type='button' className="absolute top-4 right-4" />
            <ul>
              {
                values.map((value: SocialPlatform) => {
                  // add timeout so the UI doesn't jump around..... fml
                  return <SelectListItem key={value} icon={value.toLowerCase() as IconType} title={value}
                    onClick={() => setTimeout(() => onSelect(value), 200)} />;
                })
              }
            </ul>
          </div>
        </div>
      </div>
    </CSSTransition>
  </>;
};

export default SelectList;
