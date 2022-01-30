import TeaserCore, { ITeaserCoreProps } from "./TeaserCore";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import classNames from "classnames";

export type IAccordionTeaserProps = {
  defaultExtended?: boolean
} & ITeaserCoreProps;

const AccordionTeaser = (props: PropsWithChildren<IAccordionTeaserProps>) => {
  const [height, setHeight] = useState(0);
  const childHeight = useRef<HTMLDivElement>(null);
  const [showOverflow, setShowOverflow] = useState(false);
  const { children, icons = <></>, defaultExtended = false, ...rest } = props;
  useEffect(() => {
    if(defaultExtended) {
      toggleExtended();
    }
  }, [defaultExtended]);


  const toggleExtended = () => {
    if(height !== 0) {
      setShowOverflow(false);

      setHeight(0);
      return;
    }
    const newHeight = childHeight.current?.offsetHeight ?? 0;
    setHeight(newHeight);
  };

  const iconRotation = classNames({
    'transform rotate-180': height !== 0
  });

  const overflow = classNames({
    'overflow-hidden': !showOverflow,
    'overflow-visible': showOverflow
  });

  const handleTransitionEnd = () => {
    if(height !== 0) {
      setShowOverflow(true);
    }
  };

  const icon = <>
    {icons}
    <button onClick={toggleExtended}>
      <Icon path={'/assets/arrow-down.svg'} className={`h-8 w-8 ${iconRotation}`}/>
    </button>
  </>;

  return <div className='flex flex-col mb-2'>
    <div onClick={toggleExtended} className='cursor-pointer'>
      <TeaserCore {...rest} icons={icon} className='mb-0 pb-0 rounded-b-none'/>
    </div>
    <div className='pt-2 mx-3 rounded-b-xl bg-white dark:bg-gray-2'>
      <div style={{ height: `${height}px` }}
           className={`mx-3 transition-all ease-in-out duration-200 ${overflow}`}
           onTransitionEnd={handleTransitionEnd}>
        <div ref={childHeight}>
          {children}
        </div>
      </div>
    </div>
  </div>;
};

export default AccordionTeaser;
