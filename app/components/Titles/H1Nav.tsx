import type { PropsWithChildren } from "react";
import Icon from "../Icons";
import H1 from "./H1";
import { Link } from "@remix-run/react";

type BreakpointPaths = {
  small: string,
  big: string,
  breakpoint: 'sm' | 'md' | 'lg'
}

type IH1NavProps = {
  title: string
} & (
    {
      path: string;
      paths?: never;
    } | {
      path?: never;
      paths: BreakpointPaths
    });

const H1Nav = ({ path, paths, children, title }: PropsWithChildren<IH1NavProps>) => {
  const content = <>
    <Icon iconName='arrowDown' className='h-8 w-8 rotate-90' />
    <H1 className={`!mt-0 !mb-0`}>{title}</H1>
  </>;

  return <div className='flex w-full justify-between max-w-lg items-center mb-2'>
    {path && <Link to={path} className='flex items-center'>
      {content}
    </Link>}
    {paths && <>
      <Link to={paths.small} className={`flex ${paths.breakpoint}:hidden`}>
        {content}
      </Link>
      <Link to={paths.big} className={`hidden  ${paths.breakpoint}:flex`}>
        {content}
      </Link>
    </>}
    {children}
  </div>;
};

export default H1Nav;
