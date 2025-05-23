import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import classNames from "classnames";
import type { Game } from "@prisma/client";
import type { StringOrNull } from "~/db/queries.server";
import Icons from "~/components/Icons";
import { useImage } from "~/context/image-provider";

export interface ITeaserCoreProps {
  avatarPath: StringOrNull,
  name: StringOrNull,
  team?: StringOrNull,
  description?: StringOrNull,
  games: Omit<Game, 'id'>[],
}

const TeaserCore = (props: PropsWithClassName<ITeaserCoreProps>) => {
  const { name = '', team = '', description = '', avatarPath, games = [], className = '' } = props;
  const imageRoot = useImage();

  const background = classNames({
    'bg-white hover:bg-gray-200': !className?.includes("bg-"),
    'dark:bg-gray-2 dark:hover:bg-gray-3': !className?.includes("dark:bg-")
  });

  return <div className={`w-full flex items-center p-3 pr-16 my-2 rounded-xl ${background} ${className} transition-colors`}>
    <div className='rounded-full h-10 w-10 min-w-[2.5rem] m-1 bg-white relative overflow-hidden'>
      {!avatarPath && <Icons iconName='user' className={`absolute m-1 text-black`} />}
      {avatarPath && <img src={imageRoot + avatarPath} className={`absolute object-fill h-full w-full`} alt='profile picture' />}
    </div>
    <div className="flex-grow overflow-hidden">
      <div className="mx-1 flex items-center gap-3">
        <span className="font-bold break-all block">{name ?? ''}</span>
        {team &&
          <span className="text-sm"> ({team ?? ''})</span>
        }
      </div>
      {!!description &&
        <div className="mx-1">
          <span className="text-sm">{description}</span>
        </div>
      }
      {games && games.map((game: Omit<Game, 'id'>) => {
        if (!!game) {
          return <span key={game.name} className="rounded-full whitespace-nowrap text-sm px-3 mx-1 bg-gray-6 dark:bg-gray-3">
            {game.name}
          </span>
        }
      })
      }
    </div>
  </div>;
};

export default TeaserCore;
