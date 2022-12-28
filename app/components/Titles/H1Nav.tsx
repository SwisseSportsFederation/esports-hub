import type { PropsWithChildren } from "react";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import Icon from "../Icons";
import H1 from "./H1";
import { Link } from "@remix-run/react";

interface IH1NavProps {
  path: string,
}

const H1Nav = ({ path, children, className = '' }: PropsWithChildren<PropsWithClassName<IH1NavProps>>) => {
  return <div className='flex'>
    <Link to={path} className='flex items-center mb-2'>
      <Icon iconName='arrowDown' className='h-8 w-8 rotate-90'/>
      <H1 className={`!mt-0 !mb-0 ${className}`}>{children}</H1>
    </Link>
  </div>;
};

export default H1Nav;
