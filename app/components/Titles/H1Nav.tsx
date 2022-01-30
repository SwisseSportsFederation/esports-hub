import { PropsWithChildren } from "react";
import { PropsWithClassName } from "~/utils/PropsWithClassName";
import Icon from "../Icon";
import H1 from "./H1";
import { Link } from "remix";

interface IH1NavProps {
  path: string,
}

const H1Nav = ({ path, children, className = '' }: PropsWithChildren<PropsWithClassName<IH1NavProps>>) => {
  return (
    <Link to={path} className='flex items-center'>
      <Icon path={'/assets/arrow-down.svg'} className='mb-5 transform rotate-90 w-8 h-8'/>
      <H1 className={`ml-2 ${className}`}>{children}</H1>
    </Link>
  );
};

export default H1Nav;
