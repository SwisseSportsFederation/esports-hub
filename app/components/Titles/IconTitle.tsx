import type { PropsWithChildren } from "react";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { IconType } from "../Icons";
import Icon from "../Icons";
import type { EntityType } from "@prisma/client";

interface IIconTitleProps {
  type: EntityType
}

const IconTitle = ({ type, children, className = '' }: PropsWithChildren<PropsWithClassName<IIconTitleProps>>) => {

  const icon: IconType = type == 'USER' ? "user" : type === 'ORGANISATION' ? 'organisation' : 'team';
  return (
    <>
      <h1 className={`font-bold text-2xl ${className} mb-5`}>
        <Icon iconName={icon} className='inline mr-5 w-12 h-12'/>
        {children}
      </h1>
    </>
  );
};

export default IconTitle;
