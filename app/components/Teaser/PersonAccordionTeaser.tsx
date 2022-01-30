import AccordionTeaser from "./AccordionTeaser";
import TextInput from "../Form/TextInput";
import { useState } from "react";
import RadioButtonGroup, { RadioButtonValue } from "../Form/RadioButtonGroup";
import ActionButton from "../Button/ActionButton";
import IUser from "../../models/IUser";
import AccessRightsEnum from "../../models/enums/AccessRightsEnum";

const types: RadioButtonValue[] = Object.keys(AccessRightsEnum)
  .filter((f: string) => !isNaN(Number(f)))
  .map((m: string) => Number(m))
  .map((index: number) => ({
    id: index,
    name: AccessRightsEnum[index]
  }));


// not 100% sure what model should be used here
export interface IMember {
  user: IUser;
  role: string;
  type: AccessRightsEnum
}

type IPersonAccordionTeaserProps = {
  onKick: ((id: number) => void);
  onSave: ((member: IMember) => void);
  member: IMember;
};

const PersonAccordionTeaser = ({ onKick, onSave, member }: IPersonAccordionTeaserProps) => {
  const [localMember, setMember] = useState(member);
  const handleChangeRole = (role: string) => {
    setMember({
      ...localMember,
      role
    });
    console.log(JSON.stringify(localMember));
  };

  const handleChangeType = (type: RadioButtonValue) => {
    setMember({
      ...localMember,
      type: type.id
    });
    console.log(JSON.stringify(localMember));
  };

  return <AccordionTeaser
    name={localMember.user.name}
    games={localMember.user.games}
    avatarPath={localMember.user.image}>
    <div className='py-5 flex items-center flex-col space-y-4 w-full max-w-xl mx-auto'>
      <TextInput id='id' label='Role' value={localMember.role} onChange={handleChangeRole}/>
      <RadioButtonGroup values={types} onChange={handleChangeType} id={`user-rights-${localMember.user.id}`}
                        selected={localMember.type}/>
      <div className='w-full flex flex-row space-x-4 justify-center'>
        <ActionButton content='Save' action={() => onSave(localMember)}/>
        <ActionButton content='Kick' action={() => onKick(member.user.id)}/>
      </div>
    </div>
  </AccordionTeaser>;
};

export default PersonAccordionTeaser;
