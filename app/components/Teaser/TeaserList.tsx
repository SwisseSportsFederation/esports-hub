import H1 from "../Titles/H1";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { ITeaserProps } from "~/components/Teaser/Teaser";
import Teaser from "~/components/Teaser/Teaser";

interface ITeaserListProps {
  title: string;
  teasers: ITeaserProps[];
  teaserClassName?: string;
}

const TeaserList = ({ title, teasers, className = '', teaserClassName = '' }: PropsWithClassName<ITeaserListProps>) => {
  return <div>
    <H1 className={`mx-2 px-2 mb-1 ${className}`}>{title}</H1>
    {!!teasers && teasers.length > 0 &&
      teasers.map((teaser: ITeaserProps, index: number) =>
        <Teaser key={`${teaser.name}-${index}`} {...teaser} className={teaserClassName}/>)
    }
  </div>;
};

export default TeaserList;
