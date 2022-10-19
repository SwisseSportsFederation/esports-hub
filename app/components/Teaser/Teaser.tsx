import TeaserCore, { ITeaserCoreProps } from "./TeaserCore";
import { PropsWithClassName } from "~/utils/PropsWithClassName";
import { Link } from "@remix-run/react";

const Teaser = (props: PropsWithClassName<ITeaserCoreProps>) => {
  return <Link to={`/`}>
    <TeaserCore {...props}/>
  </Link>;
};

export default Teaser;
