import type { ReactNode } from "react";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import classNames from "classnames";
import type { games } from "@prisma/client";

// TODO Check if TeaserCoreProps are fine like this, because somehow we need to know if it's a team, user or organisation
export interface ITeaserCoreProps {
  avatarPath?: string,
  name: string,
  team?: string,
  games: games[],
  icons?: ReactNode
}

const TeaserCore = (props: PropsWithClassName<ITeaserCoreProps>) => {
  const { name, team, avatarPath, games, icons = <></>, className } = props;

  const background = classNames({
    'bg-white': !className?.includes("bg-"),
    'dark:bg-gray-2': !className?.includes("dark:bg-")
  });

  const imagePath = avatarPath ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${avatarPath}` : "/assets/user-solid.svg";

  return <div className={`flex items-center p-3 mx-3 my-2 rounded-xl ${background} ${className}`}>
    <div className='rounded-full h-10 w-10 min-w-[2.5rem] m-1 bg-white relative overflow-hidden'>
      <img src={imagePath} alt="User profile" className={`absolute p-1`}/>
    </div>
    <div className="flex-grow overflow-hidden">
      <div className="mx-1">
        <span className="font-bold">{name}</span>
        {team &&
          <span className="text-sm"> ({team})</span>
        }
      </div>
      {games && games.map((game: games) =>
        <span key={game.name} className="rounded-full whitespace-nowrap text-sm px-3 mx-1 bg-gray-6 dark:bg-gray-3">
                {game.name}
              </span>)
      }
    </div>
    <div className="flex-none flex-end space-x-2 flex">
      {icons}
    </div>
  </div>;
};

export default TeaserCore;
