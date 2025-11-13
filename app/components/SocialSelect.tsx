import TextInput from "./Forms/TextInput";
import IconButton from "./Button/IconButton";
import ActionButton from "./Button/ActionButton";
import type { Social, EntityType, SocialPlatform } from "@prisma/client";
import { SocialPlatformValue } from "~/models/database.model";
import SelectList from "~/components/SelectList";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { ToastMessageListener } from "./Notifications/ToastMessageListener";
import { useToast } from "~/hooks/useToast";


interface ISocialSelectProps {
  entityType: EntityType;
  socials: Social[];
  id: number;
}

type SelectableSocial = {
  name: string;
  platform: SocialPlatform;
};

const getSelectableSocials = (socials: SelectableSocial[]) => {
  return Object.values(SocialPlatformValue).filter(social => !socials.some(soc => soc.platform === social))
}

const getErrorForPath = (path: string, data: any) => {
  return data?.issues?.find((issue: { path: string[] }) => issue.path[0] === path)?.message
};

const getPlaceHolderForSocial = (social: SelectableSocial) => {
  switch (social.platform) {
    case SocialPlatformValue.TWITTER:
      return "https://x.com/yourname"
    case SocialPlatformValue.FACEBOOK:
      return "https://facebook.com/yourname"
    case SocialPlatformValue.DISCORD:
      return "yourtag"
    case SocialPlatformValue.BATTLENET:
      return "yourtag#1234"
    case SocialPlatformValue.INSTAGRAM:
      return "https://instagram.com/yourname"
    case SocialPlatformValue.ORIGIN:
      return "yourname"
    case SocialPlatformValue.TWITCH:
      return "https://twitch.tv/yourname"
    case SocialPlatformValue.STEAM:
      return "yourNickname"
    case SocialPlatformValue.UPLAY:
      return "yourNickname"
    case SocialPlatformValue.TIKTOK:
      return "https://www.tiktok.com/@yourname"
    case SocialPlatformValue.YOUTUBE:
      return "https://www.youtube.com/channel/your-channel-id"
    case SocialPlatformValue.WEBSITE:
      return "https://sesf.ch"
    default:
      return social.platform
  }
}

const SocialSelect = ({ entityType, id, socials: rawSocials }: ISocialSelectProps) => {
  const [edit, setEdit] = useState(false);
  const [socials, setSocials] = useState<SelectableSocial[]>(rawSocials);
  const fetcher = useFetcher();
  const form = useRef<HTMLFormElement | null>(null);
  const { add: addToast } = useToast();

  useEffect(() => {
    if (!(fetcher.state === 'idle' && fetcher.data != null)) {
      return;
    }
    if (Object.keys(fetcher.data).length <= 1) {
      setEdit(false);
      setSocials(rawSocials);
    }
    if (fetcher.data && typeof fetcher.data === "object" && "toast" in fetcher.data && fetcher.data.toast) {
      addToast(fetcher.data.toast);
    }
  }, [rawSocials, fetcher.state, fetcher.data, addToast]);

  const selectables = getSelectableSocials(socials);
  const addLocalSocial = (platform: SocialPlatform) => {
    setSocials([...socials, { name: '', platform }]);
    setEdit(true);
  };

  const removeLocalSocial = (social: SelectableSocial) => {
    setSocials(socials.filter(soc => soc !== social));
  };

  const reset = () => {
    setSocials(socials.filter(soc => soc.name !== ""));
    form.current?.reset();
    setEdit(false);
  }

  const fieldHasError = (path: string) => {
    return fetcher.data?.issues?.some((issue: { path: string[] }) => issue.path[0] === path);
  }

  return <div className='w-full flex justify-center items-center flex-wrap flex-col space-y-6'>
    <fetcher.Form className='w-full flex items-center flex-col space-y-6' ref={form} method='post'
      action='/admin/api/socials' encType='multipart/form-data'>
      <input type='hidden' name='entity' value={entityType} />
      <input type='hidden' name='entityId' value={id} />
      {socials.map((social: SelectableSocial) => {
        return <div className='flex flex-col gap-2 max-w-md w-full' key={social.platform}>
          {!edit &&
            <TextInput id={social.platform.toLowerCase()} label={social.platform} disabled={true}
              defaultValue={social.name}
              inputClassName='disabled:bg-gray-4 dark:disabled:bg-gray-3 disabled:text-color disabled:border-none' />
          }
          {edit &&
            <>
              <div className='flex flex-row gap-2'>
                <TextInput id={social.platform.toLowerCase()} label={social.platform} defaultValue={social.name} placeholder={getPlaceHolderForSocial(social)} />
                <IconButton icon='decline' className='mt-3 h-9 w-9' action={() => removeLocalSocial(social)}
                  type='button' />
              </div>
              {fieldHasError(social.platform.toLowerCase()) &&
                <span className='text-red-1 basis-full normal-case'>
                  {getErrorForPath(social.platform.toLowerCase(), fetcher.data)}
                </span>}
            </>
          }
        </div>;
      })}
      <SelectList values={selectables} onSelect={addLocalSocial} showButton={edit} />
      {!edit && <ActionButton content='Edit' action={() => setEdit(true)} />}
      {edit && <div className='w-full flex gap-4 justify-between'>
        <ActionButton content='Cancel' action={reset} />
        <ActionButton content='Save' type='submit' />
      </div>}
    </fetcher.Form>
  </div>;
};

export default SocialSelect;
