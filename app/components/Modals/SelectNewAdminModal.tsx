import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import IconButton from "~/components/Button/IconButton";
import TextInput from "~/components/Forms/TextInput";
import Icons from "~/components/Icons";
import Modal from "~/components/Notifications/Modal";
import type { ITeaserProps } from "~/components/Teaser/LinkTeaser";
import TeaserList from "~/components/Teaser/TeaserList";
import H1 from "~/components/Titles/H1";

const SelectNewAdminModal = (
	{ isOpen, handleClose, groupId, userId }:
		{ isOpen: boolean, handleClose: (value: boolean) => void, groupId: string, userId: string }) => {
	const fetcher = useFetcher();
		useEffect(() => {
		fetcher.submit({ intent: 'SEARCH', groupId, search: '' }, { method: 'post', action: '/admin/api/group/members' })
		}, [groupId]);
	// @ts-ignore
	const searchTeaser = (fetcher.data?.members ?? []).map(member => ({ ...member, ...member.user })).filter(member => member.user_id !== userId);

	const addAsAdminIcon = (teaser: ITeaserProps) => {
		return <fetcher.Form method='post' action={`/admin/api/groupMember`} onSubmit={() => handleClose(false)}>
		<input type='hidden' name='groupId' value={groupId}/>
		<input type='hidden' name='newAdminUserId' value={teaser.id}/>
		<input type='hidden' name='userId' value={userId}/>
		<input type='hidden' name='intent' value='PROMOTE_USER'/>
		<IconButton icon='accept' type='submit'/>
		</fetcher.Form>
	}
	return <Modal isOpen={isOpen} handleClose={() => handleClose(false)}>
		<H1 className='text-2xl text-color'>Select new Administrator</H1>
		<fetcher.Form method="post" autoComplete={"on"} className='sticky top-0 z-50' action={'/admin/api/group/members'}>
		<input type='hidden' name='intent' value="SEARCH"/>
		<input type='hidden' name='groupId' value={groupId}/>
		<div className="max-w-sm md:max-w-lg">
			<TextInput id="search" label="Search" searchIcon={true}
						buttonType="submit" defaultValue={""}/>
		</div>
		</fetcher.Form>
		<TeaserList type='Static' title="" teasers={searchTeaser} teaserClassName='dark:bg-gray-1 text-color'
					iconFactory={addAsAdminIcon}/>
		{(!fetcher.data || fetcher.data?.members?.length === 0) &&
		<div className='w-full h-40 flex flex-col justify-center items-center'>
			<Icons iconName='search' className='w-20 h-20 fill-white'/>
			<H1 className='text-color'>No results</H1>
		</div>
		}
	</Modal>
};

export default SelectNewAdminModal;
