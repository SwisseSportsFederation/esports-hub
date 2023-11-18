import { useCallback, useEffect } from "react";
import IconButton from "~/components/Button/IconButton";
import { Form, useFetcher, useTransition } from "@remix-run/react";
import type { Game, User } from "@prisma/client";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import Modal from "~/components/Notifications/Modal";
import TextInput from "~/components/Forms/TextInput";
import TeaserList from "~/components/Teaser/TeaserList";
import Icons from "~/components/Icons";
import H1 from "~/components/Titles/H1";

const SearchModal = ({ isOpen, handleClose, groupId }: { isOpen: boolean, handleClose: (value: boolean) => void, groupId: string }) => {
	const fetcher = useFetcher();
	const transition = useTransition();
	const manualSearch = useCallback(() => {
	  fetcher.submit({ notInTeam: groupId, search: '' }, { method: 'post', action: '/admin/api/users' });
	}, []);
	useEffect(() => {
	  manualSearch()
	}, [manualSearch]);
  
	useEffect(() => {
	  if (transition.state === 'loading') {
		manualSearch();
	  }
	}, [manualSearch, transition])
	const addInviteIcons = (teaser: ITeaserProps) => <Form method='post'>
	  <input type='hidden' name='groupId' value={groupId} />
	  <input type='hidden' name='userId' value={teaser.id} />
	  <input type='hidden' name='intent' value='INVITE_USER' />
	  <IconButton icon='add' type='submit' />
	</Form>;
	const convert = (users: (User & { games: Game[] })[]): Omit<ITeaserProps, 'icons'>[] => {
	  return users.map(user => ({
		id: String(user.id),
		team: '',
		name: user.handle,
		type: 'USER',
		handle: user.handle,
		games: user.games,
		avatarPath: user.image
	  }));
	};
	// @ts-ignore
	const searchTeaser = convert(fetcher.data?.users ?? []);
	return <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
	  <fetcher.Form method="post" autoComplete={"on"} className='sticky top-0 z-50' action={'/admin/api/users'}>
		<input type='hidden' name='notInTeam' value={groupId} />
		<div className="max-w-sm md:max-w-lg">
		  <TextInput id="search" label="Search" searchIcon={true}
			buttonType="submit" defaultValue={""} />
		</div>
	  </fetcher.Form>
	  <div className='max-h-[70vh]'>
		<TeaserList title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-color'
		  iconFactory={addInviteIcons} />
	  </div>
	  {searchTeaser.length === 0 &&
		<div className='w-full h-40 flex flex-col justify-center items-center'>
		  <Icons iconName='search' className='w-20 h-20 fill-white' />
		  <H1 className='text-color'>No results</H1>
		</div>
	  }
	</Modal>
  
  }

export default SearchModal;
