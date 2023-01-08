import type { PropsWithChildren } from "react";
import Icon from "../Icons";
import H1 from "./H1";
import { Link } from "@remix-run/react";

interface IH1NavProps {
  path: string,
  title: string
}

const H1Nav = ({ path, children, title }: PropsWithChildren<IH1NavProps>) => {
  return <div className='flex w-full justify-between max-w-lg items-center mb-2'>
    <Link to={path} className='flex items-center'>
      <Icon iconName='arrowDown' className='h-8 w-8 rotate-90'/>
      <H1 className={`mt-0 mb-0`}>{title}</H1>
    </Link>
    {children}
  </div>;
};

export default H1Nav;
