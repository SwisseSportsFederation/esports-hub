import type { ITeaserCoreProps } from "./TeaserCore";
import TeaserCore from "./TeaserCore";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import { Link } from "@remix-run/react";

const Teaser = (props: PropsWithClassName<ITeaserCoreProps>) => {
  return <Link to={`/`}>
    <TeaserCore {...props}/>
  </Link>;
};

export default Teaser;
