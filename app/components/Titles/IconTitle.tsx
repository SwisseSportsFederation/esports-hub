import { PropsWithChildren } from "react";
import EntityType, { getEntityTypeNamePlural } from "../../models/enums/EntityTypeEnum";
import { PropsWithClassName } from "../../utils/PropsWithClassName";
import Icon from "../Icon";

interface IIconTitleProps {
  type: EntityType
}

const IconTitle = ({ type, children, className = '' }: PropsWithChildren<PropsWithClassName<IIconTitleProps>>) => {
  const icon = type == EntityType.User ? "user-solid" :  getEntityTypeNamePlural(type);
  return (
    <>
      <h1 className={`font-bold text-2xl ${className} mb-5`}>
        <Icon path={`/assets/${icon}.svg`} className='inline mr-5 w-12 h-12' />
        {children}
      </h1>
    </>
  );
};

export default IconTitle;
