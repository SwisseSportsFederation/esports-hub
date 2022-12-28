import type { PropsWithChildren } from "react";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import Icon, { IconType } from "../Icons";
import { EntityType } from "~/helpers/entityType";

interface IIconTitleProps {
  type: EntityType
}

const IconTitle = ({ type, children, className = '' }: PropsWithChildren<PropsWithClassName<IIconTitleProps>>) => {

  const icon: IconType = type == 'USER' ? "user" : type === 'ORG' ? 'organisation' : 'team';
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
