import type { ITeaserCoreProps } from "~/components/Teaser/TeaserCore";
import type { PropsWithChildren, ReactElement } from "react";
import { useState } from "react";
import classNames from "classnames";
import Icon from "~/components/Icons";
import Teaser from "~/components/Teaser/Teaser";

export type IExpandableTeaserProps = {
  defaultExpanded?: boolean,
  additionalIcons?: ReactElement,
  expandable?: boolean
} & ITeaserCoreProps;
const ExpandableTeaser = (props: PropsWithChildren<IExpandableTeaserProps>) => {
  const { defaultExpanded, additionalIcons, children, expandable = true, ...teaserProps } = props;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const test = classNames({
    'h-0': !expanded
  });
  const iconRotation = classNames({
    'transform rotate-180': expanded
  });

  const icons = <>
    {additionalIcons}
    {expandable && <Icon iconName='arrowDown' className={`mt-2 h-8 w-8 ${iconRotation}`} />}
  </>

  return <div className='flex flex-col w-full'>
    <div onClick={() => expandable && setExpanded(!expanded)} className='relative cursor-pointer'>
      <Teaser icons={icons} {...teaserProps}
        className='mb-0 pb-0 rounded-b-none w-full mt-0' />
    </div>
    <div className={`pt-2 rounded-b-xl bg-white dark:bg-gray-2 overflow-hidden ${test}`}>
      {expanded && expandable && children}
    </div>
  </div>;
};

export default ExpandableTeaser;
