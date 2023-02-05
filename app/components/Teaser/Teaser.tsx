import type { ITeaserCoreProps } from "./TeaserCore";
import TeaserCore from "./TeaserCore";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { ReactNode } from "react";

export type ITeaserProps = {
  icons?: ReactNode
} & ITeaserCoreProps;

const Teaser = ({ icons = <></>, ...props }: PropsWithClassName<ITeaserProps>) => {
  return <div className='flex h-22 w-full relative max-w-lg'>
    <TeaserCore {...props}/>
    <div className="absolute h-full top-0 right-4 flex items-center">
      {icons}
    </div>
  </div>;
};

export default Teaser;
