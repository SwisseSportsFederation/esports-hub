import Icon from "../Icon";
import { Link } from "@remix-run/react";

export interface IBlockTeaserProps {
  path: string,
  icon: string,
  text: string
}

const BlockTeaser = (props: IBlockTeaserProps) => {
  const { path, icon, text } = props;

  return (
    <div className="w-20 h-auto md:w-28 mx-2 my-3 cursor-pointer">
      <Link to={path}>
        <div className="rounded-xl px-3 pb-4 pt-5 transition-colors bg-white hover:bg-gray-6 dark:bg-gray-2
        dark:hover:bg-gray-3">
          <div className="flex justify-center">
            <Icon path={`/assets/${icon}`} className={`h-8 w-12 mb-2 text-black dark:text-white`}/>
          </div>
          <div className="hidden md:flex justify-center items-center mt-1">
            <span className="text-sm font-bold">{text}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlockTeaser;
