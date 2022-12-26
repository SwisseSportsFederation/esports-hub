import React from "react";
import IconButton from "../Button/IconButton";
import SocialIconButton from "../Button/SocialIconButton";
import { checkUserAuth } from "~/utils/auth.server";
import classNames from "classnames";
import { Link } from "@remix-run/react";
import { games, socials } from "@prisma/client";

type IDetailHeaderProps = {
  imagePath?: string,
  name: string,
  entitySocials?: socials[],
  games?: games[],
  isMember?: boolean,
  onApply?: (() => void)
} & ({
  parentName: string,
  parentLink: string
} | {
  parentName?: never,
  parentLink?: never
})

const DetailHeader = (props: IDetailHeaderProps) => {
  const { imagePath, name, parentLink, parentName, entitySocials, games, isMember, onApply } = props;
  const user = checkUserAuth(request);

  const avatarPath = imagePath ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${imagePath}` : "/assets/user-solid.svg";

  const imagePadding = classNames({
    '!p-1 bg-white rounded-full': avatarPath === "/assets/user-solid.svg",
  });

  const imgLoader = ({ src }: ImageLoaderProps) => {
    return src;
  };

  return (
    <div className="max-w-full">
      <div className="p-3 rounded-xl bg-white bg-gray-7 dark:bg-gray-2">
        <div className="flex justify-center relative">
          <div className="flex-none rounded-full h-40 w-40 m-1 relative overflow-hidden">
            <Image loader={imgLoader} src={avatarPath} alt="Profile Picture" layout='fill'
                   className={`absolute ${imagePadding}`} objectFit='contain' quality={50}/>
          </div>
          {onApply && user && !isMember &&
            <div className="absolute right-0 top-2">
              <IconButton icon={"apply"} action={onApply} size="large" />
            </div>
          }
        </div>
        <div className="flex justify-center items-center mb-2 font-bold text-2xl">
          {name}
        </div>
        {parentLink && parentName &&
          <div className="flex justify-center items-center mb-3 text-red-1 text-xl">
            <Link to={`${parentLink}`}>
              <a>{parentName}</a>
            </Link>
          </div>
        }
        <div className="flex justify-center items-center mb-5">
          <div className="flex justify-center flex-wrap">
            {games &&
              games.map((game: IGame) =>
                <span key={game.id} className="rounded-full my-1 whitespace-nowrap text-sm px-3 mx-2 bg-gray-6 dark:bg-gray-3">{game.name}</span>
              )
            }
          </div>
        </div>
        <div className="flex justify-center flex-wrap">
          {entitySocials &&
            entitySocials
              .filter((entitySocials: IEntitySocial) => entitySocials.name !== "")
              .map((entitySocial: IEntitySocial) =>
                <SocialIconButton key={entitySocial.social.id} entitySocial={entitySocial} />
            )
          }
        </div>
      </div>
    </div>
  );
};

export default DetailHeader;
