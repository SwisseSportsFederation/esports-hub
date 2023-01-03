import { Reducer } from "react";
import { ISocialSelect } from "../components/SocialSelect";

export type SocialSelectAction =
  | { type: "UPDATE_STATE"; socials: ISocialSelect[] }
  | { type: "ADD_SOCIAL"; social: ISocialSelect }
  | { type: "REMOVE_SOCIAL"; social: ISocialSelect }
  | { type: "UPDATE_SOCIAL"; social: ISocialSelect; socialUsername: string };


export interface SocialSelectState {
  emptySocials: ISocialSelect[],
  socials: ISocialSelect[]
}

const emptySocialSorter = (soc: ISocialSelect, other: ISocialSelect) => soc.id - other.id;

export const SocialSelectReducer: Reducer<SocialSelectState,
  SocialSelectAction> = (state: SocialSelectState, action: SocialSelectAction): SocialSelectState => {
  switch(action.type) {
    case 'UPDATE_STATE': {
      const socials = action.socials.filter((social: ISocialSelect) => social.socialUsername !== "");
      const emptySocials = action.socials.filter((social: ISocialSelect) => social.socialUsername === "").sort(emptySocialSorter);
      return {
        socials,
        emptySocials
      };
    }
    case 'ADD_SOCIAL': {
      const socials = [...state.socials, action.social];
      const emptySocials = state.emptySocials.filter((soc: ISocialSelect) => soc !== action.social);
      return {
        socials,
        emptySocials
      };
    }
    case 'REMOVE_SOCIAL': {
      const socials = state.socials.filter((soc: ISocialSelect) => soc !== action.social);
      action.social.socialUsername = "";
      const emptySocials = [...state.emptySocials, action.social].sort(emptySocialSorter);
      return {
        socials,
        emptySocials
      };
    }
    case 'UPDATE_SOCIAL': {
      const index = state.socials.indexOf(action.social);
      state.socials.splice(index, 1, {
        ...state.socials[index],
        socialUsername: action.socialUsername
      });
      return {
        socials: state.socials,
        emptySocials: state.emptySocials
      };
    }
  }
  return state;
};
