import TextInput from "./Forms/TextInput";
import IconButton from "./Button/IconButton";
import ActionButton from "./Button/ActionButton";
// import { SocialSelectAction, SocialSelectReducer, SocialSelectState } from "../reducers/SocialSelectReducer";
import { EntityType } from "~/helpers/entityType";
import { Social, SocialPlatform } from "@prisma/client";
import SelectList, { ISelectListValue } from "~/components/SelectList";

export type ISocialSelect = {
  id: number;
  socialName: string;
  socialUsername: string;
}

const initState = {
  emptySocials: [],
  socials: []
};

interface ISocialSelectProps {
  entityType: EntityType;
  socials: Social[];
  id: number;
}

const SocialSelect = ({ entityType, id, socials }: ISocialSelectProps) => {
  const selectableSocials = Object.values(SocialPlatform).filter(social => !socials.some(soc => soc.platform === social))
  return <div className='w-full flex justify-center items-center flex-wrap flex-col space-y-6'>
    {socials.map((social: Social) => {
      return <div className='flex flex-row space-x-4 max-w-md w-full' key={Number(social.id)}>
        <TextInput id={social.platform} label={social.platform}
                   defaultValue={social.name}/>
        <IconButton icon='decline' className='mt-3 h-9 w-9' action={() => void 0}
                    type='button'/>
      </div>;
    })}

    <SelectList values={selectableSocials} onSelect={() => void 0}/>
    <ActionButton content='Save' action={() => void 0}/>
  </div>;
};

export default SocialSelect;
// const selectListValues = state.emptySocials.map((soc: ISocialSelect) => ({
//   title: soc.socialName,
//   icon: `${soc.socialName.toLowerCase()}.svg`
// }));

// const save = async () => {
//   const socials = state.socials.concat(state.emptySocials);
//   const token = await getAccessTokenSilently();
//   const res = await authenticatedFetch(`/socials/${entityType}/${id}`, {
//     method: 'PUT',
//     body: JSON.stringify(socials)
//   }, token).catch((err: Error) => console.error(err));
//   console.log(res);
// };

// const { getAccessTokenSilently } = useAuth0();
// const init = useInitMemo();
// const {
//   data: socialsData,
//   error: socialsError
// } = useAuthenticatedSWR<ISocialSelect[]>(`/socials/${entityType}/${id}`, init);
// const [state, dispatch] = useReducer<Reducer<SocialSelectState, SocialSelectAction>>(SocialSelectReducer, initState);
// useEffect(() => {
//   if(!socialsData) {
//     return;
//   }
//
//   dispatch({
//     type: "UPDATE_STATE",
//     socials: socialsData
//   });
// }, [socialsData]);


// const handleSelect = (value: ISelectListValue) => {
//   const social = state.emptySocials.find((soc: ISocialSelect) => soc.socialName === value.title);
//   if(!social) {
//     return;
//   }
//   dispatch({ type: 'ADD_SOCIAL', social });
// };

// if(socialsError) {
//   return <>
//     Can&apos;t fetch socials. Try again later
//   </>;
// }
