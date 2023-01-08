import H1 from "../Titles/H1";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import LinkTeaser from "~/components/Teaser/LinkTeaser";
import { ReactNode } from "react";

type ITeaserListProps = {
  title: string;
  teasers: ITeaserProps[];
  teaserClassName?: string;
} & ({
  staticIcon?: never;
  iconFactory?: (teaser: ITeaserProps) => ReactNode;
} | {
  staticIcon?: ReactNode;
  iconFactory?: never;
});

const TeaserList = ({
                      title,
                      teasers,
                      className = '',
                      teaserClassName = '',
                      iconFactory,
                      staticIcon
                    }: PropsWithClassName<ITeaserListProps>) => {

  if(teasers.length === 0) {
    return null;
  }

  return <div className='w-full'>
    <H1 className={`mx-2 px-2 mb-1 ${className}`}>{title}</H1>
    {!!teasers && teasers.length > 0 &&
      teasers.map((teaser: ITeaserProps, index: number) => {
        const icons = staticIcon ?? iconFactory?.(teaser);
        return <LinkTeaser key={`${teaser.name}-${index}`} icons={icons} {...teaser} className={teaserClassName}/>
      })
    }
  </div>;
};

export default TeaserList;
