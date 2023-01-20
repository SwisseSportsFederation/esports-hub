import { ITeaserCoreProps } from "~/components/Teaser/TeaserCore";
import { PropsWithChildren, useState } from "react";
import classNames from "classnames";
import Icon from "~/components/Icons";
import Teaser from "~/components/Teaser/Teaser";
import { ReactElement } from "react";

export type IExpandableTeaserProps = {
  defaultExpanded?: boolean,
  additionalIcons?: ReactElement
} & ITeaserCoreProps;
const ExpandableTeaser = (props: PropsWithChildren<IExpandableTeaserProps>) => {
  const { defaultExpanded, additionalIcons, children, ...teaserProps } = props;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const test = classNames({
    'h-0': !expanded
  });
  const iconRotation = classNames({
    'transform rotate-180': expanded
  });

  const icons = <>
    {additionalIcons}
    <Icon iconName='arrowDown' className={`h-8 w-8 ${iconRotation}`}/>
  </>

  return <div className='flex flex-col max-w-lg w-full'>
    <div onClick={() => setExpanded(!expanded)} className='relative cursor-pointer'>
      <Teaser icons={icons} {...teaserProps}
              className='mb-0 pb-0 rounded-b-none w-full mt-0'/>
    </div>
    <div className={`pt-2 rounded-b-xl bg-white dark:bg-gray-2 overflow-hidden ${test}`}>
      {expanded && children}
    </div>
  </div>;
};

export default ExpandableTeaser;
