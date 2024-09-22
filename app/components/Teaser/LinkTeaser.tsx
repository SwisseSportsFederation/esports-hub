import type { ITeaserCoreProps } from "./TeaserCore";
import TeaserCore from "./TeaserCore";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import { Link } from "@remix-run/react";
import type { EntityType } from "@prisma/client";
import { entityToPathSegment } from "~/helpers/entityType";
import type { ReactNode } from "react";

export type ITeaserProps = {
  type: EntityType,
  id: string,
  handle: string,
  icons?: ReactNode
} & ITeaserCoreProps;

const LinkTeaser = ({ type, handle, icons = <></>, ...props }: PropsWithClassName<ITeaserProps>) => {
  const entityPathSegment = entityToPathSegment(type);
  return <div className='flex h-22 w-full relative'>
    <Link to={`/detail/${entityPathSegment}/${handle}`} className='w-full'>
      <TeaserCore {...props} />
    </Link>
    <div className="absolute h-full right-4 flex items-center">
      {icons}
    </div>
  </div>;
};

export default LinkTeaser;
