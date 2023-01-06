import { PropsWithClassName } from "../../utils/PropsWithClassName";
import Icons from "../Icons";

interface IActionBlockProps {
  onAction: () => void,
  title: string
}

const ActionBlock = ({ onAction, title, className = '' }: PropsWithClassName<IActionBlockProps>) => {
  return <div className={`text-black dark:text-white text-sm rounded-full bg-white dark:bg-gray-2
                          flex items-center justify-between px-4 py-2 w-full max-w-sm lg:max-w-full ${className}`}>
    {title}
    <button onClick={onAction} type="button">
      <Icons iconName="remove" className='w-6 h-6 hover:text-red'/>
    </button>
  </div>;
};

export default ActionBlock;
