import type { ITeaserCoreProps } from "./TeaserCore";
import TeaserCore from "./TeaserCore";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { ReactNode } from "react";

export type ITeaserProps = {
  icons?: ReactNode
} & ITeaserCoreProps;

const Teaser = ({ icons = <></>, ...props }: PropsWithClassName<ITeaserProps>) => {
  return <>
    <TeaserCore {...props}/>
    <div className="absolute h-full top-0 right-4 flex items-center">
      {icons}
    </div>
  </>;
};

export default Teaser;
