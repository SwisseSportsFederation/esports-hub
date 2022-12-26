import AccordionTeaser from "./AccordionTeaser";
import Icon from "../Icon";
import type { MouseEvent} from "react";
import { useState } from "react";
// import DateInput from "../Form/DateInput";
import ActionButton from "../Button/ActionButton";
import classNames from "classnames";
import type { Game } from "@prisma/client";


export interface IActiveEntity {
  type: 'TEAM' | 'ORGANISATION';
  id: number;
  name: string;
  image: string;
  isMain: boolean;
  joinedAt: Date;
  games: Game[];
}

interface IActiveAccordionTeaserProps {
  onLeave: ((entity: IActiveEntity) => void);
  onSave: ((entity: IActiveEntity) => void);
  onChangeMainTeam: ((entity: IActiveEntity) => void);
  entity: IActiveEntity;
}

const ActiveAccordionTeaser = ({ onLeave, onSave, onChangeMainTeam, entity }: IActiveAccordionTeaserProps) => {
  const [local, setEntity] = useState(entity);
  // const dateString = local.joinedAt.toISOString().split('T')[0];
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newEntity = {
      ...local,
      isMain: !local.isMain
    };
    setEntity(newEntity);
    onChangeMainTeam(newEntity);
  };

  const starStyle = classNames({
    'text-transparent': !local.isMain,
    'text-yellow': local.isMain
  });

  const starIcon = <button onClick={handleClick}>
    <Icon path={'/assets/star.svg'} className={`w-8 h-8 ${starStyle}`}/>
  </button>;

  // const setJoinedAt = (value: string) => {
  //   setEntity({
  //     ...local,
  //     joinedAt: new Date(value)
  //   });
  // };

  return <AccordionTeaser name={local.name} games={local.games} icons={starIcon} avatarPath={local.image}>
    <div className='py-5 flex items-center flex-col space-y-6 w-full max-w-xl mx-auto'>
      {/*<DateInput label='From' value={dateString} onChange={setJoinedAt} required={true}/>*/}
      <div className='w-full flex flex-row space-x-4 justify-center'>
        <ActionButton content='Save' action={() => onSave(local)}/>
        <ActionButton content='Leave' action={() => onLeave(local)}/>
      </div>
    </div>
  </AccordionTeaser>;
};

export default ActiveAccordionTeaser;
