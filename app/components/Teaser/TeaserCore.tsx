import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import classNames from "classnames";
import type { Game } from "@prisma/client";
import { StringOrNull } from "~/db/queries.server";
import Icons from "~/components/Icons";

export interface ITeaserCoreProps {
  avatarPath: StringOrNull,
  name: string,
  team: StringOrNull,
  games: Omit<Game, 'id'>[],
}

const TeaserCore = (props: PropsWithClassName<ITeaserCoreProps>) => {
  const { name, team, avatarPath, games, className = '' } = props;

  const background = classNames({
    'bg-white': !className?.includes("bg-"),
    'dark:bg-gray-2': !className?.includes("dark:bg-")
  });

  return <div className={`flex items-center max-w-lg p-3 pr-16 my-2 rounded-xl ${background} ${className}`}>
    <div className='rounded-full h-10 w-10 min-w-[2.5rem] m-1 bg-white relative overflow-hidden'>
      {!avatarPath && <Icons iconName='user' className={`absolute m-1 text-black`}/>}
    </div>
    <div className="flex-grow overflow-hidden">
      <div className="mx-1">
        <span className="font-bold break-all block">{name}</span>
        {team &&
          <span className="text-sm"> ({team})</span>
        }
      </div>
      {games && games.map((game: Omit<Game, 'id'>) =>
        <span key={game.name} className="rounded-full whitespace-nowrap text-sm px-3 mx-1 bg-gray-6 dark:bg-gray-3">
                {game.name}
              </span>)
      }
    </div>
  </div>;
};

export default TeaserCore;
