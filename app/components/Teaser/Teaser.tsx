import TeaserCore, { ITeaserCoreProps } from "./TeaserCore";
import { PropsWithClassName } from "~/utils/PropsWithClassName";
import { Link } from "remix";

const Teaser = (props: PropsWithClassName<ITeaserCoreProps>) => {
  return <Link to={`/`}>
    <TeaserCore {...props}/>
  </Link>;
};

export default Teaser;
