import Icon from "../Icons";
import { Link } from "@remix-run/react";

interface ILinkBlockProps {
  path: string,
  title: string
}

const LinkBlock = ({ path, title }: ILinkBlockProps) => {
  return <Link to={path} className={'text-black dark:text-white rounded-2xl bg-white' +
    ' hover:bg-gray-6 dark:bg-gray-2 dark:hover:bg-gray-3 flex items-center justify-between px-4 py-2'}>
    {title}
    <div className='p-0 m-0 transform -rotate-90'>
      <Icon iconName='arrowDown' className='w-9 h-9'/>
    </div>
  </Link>;
};

export default LinkBlock;
