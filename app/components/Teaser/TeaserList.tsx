import Teaser from "../Teaser/Teaser";
import H1 from "../Titles/H1";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { ITeaserCoreProps } from "~/components/Teaser/TeaserCore";

interface ITeaserListProps {
  title: string;
  teasers: ITeaserCoreProps[];
}

const TeaserList = ({ title, teasers, className = '' }: PropsWithClassName<ITeaserListProps>) => {
  return <div>
    <H1 className={`mx-2 px-2 ${className}`}>{title}</H1>
    {!!teasers && teasers.length > 0 &&
      teasers.map((teaser: ITeaserCoreProps, index: number) =>
        <Teaser key={`${teaser.name}-${index}`} {...teaser} />)
    }
  </div>;
};

export default TeaserList;
