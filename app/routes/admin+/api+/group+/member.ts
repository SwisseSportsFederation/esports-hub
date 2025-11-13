import { AccessRight, EntityType, RequestStatus } from "@prisma/client";
import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { zx } from 'zodix';
import { db } from "~/services/db.server";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

const promoteUser = async (userId: number, newAdminUserId: string, groupId: number) => {
	await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');
	await checkIdAccessForEntity(newAdminUserId, groupId, 'MEMBER');

	await db.groupMember.update({
		where: {
			user_id_group_id: {
				user_id: Number(newAdminUserId),
				group_id: groupId
			}
		},
		data: {
			access_rights: AccessRight.ADMINISTRATOR
		}
	});
	// todo: potentially send email
}

const leaveGroup = async (request: Request, userId: number, groupId: number) => {
	await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');

	const group = await db.group.findFirst({
		where: {
			id: groupId
		},
		include: {
			members: true
		}
	});
	if (group) {
		const activeMembers = group.members.filter(m => m.request_status === RequestStatus.ACCEPTED)
		// Set Group inactive if there is no more members
		if (activeMembers.length === 1) {
			await db.group.update({
				where: {
					id: groupId
				},
				data: {
					is_active: false
				}
			});
		} else {
			// Set new admin if member is last admin
			const admins = activeMembers.filter(m => m.access_rights === AccessRight.ADMINISTRATOR);
			if (admins?.length === 1 && admins[0].user_id === BigInt(userId)) {
				return json({ selectAdminGroupId: groupId })
			}
		}

		// delete member from group
		const groupMember = await db.groupMember.delete({
			where: {
				user_id_group_id: {
					user_id: userId,
					group_id: groupId
				}
			}
		});

		if (group.group_type === EntityType.TEAM) {
			await db.formerTeam.create({
				data: {
					user_id: userId,
					name: group.name,
					from: groupMember.joined_at,
					to: new Date(),
				}
			});
		}
	}
	return json({ toast: 'group left' });
}

const updateGroup = async (request: Request, userId: number, groupId: number, joinedAt: string) => {
	await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');
	await db.groupMember.update({
		where: {
			user_id_group_id: {
				user_id: userId,
				group_id: groupId
			}
		},
		data: {
			joined_at: new Date(joinedAt)
		}
	});
	return json({ toast: 'group updated' });
}

const changeMainGroup = async (request: Request, userId: number, groupId: number) => {
	await checkIdAccessForEntity(userId.toString(), groupId, 'MEMBER');

	await db.groupMember.updateMany({
		where: {
			user_id: userId,
		},
		data: {
			is_main_group: false
		}
	});
	await db.groupMember.update({
		where: {
			user_id_group_id: {
				user_id: userId,
				group_id: groupId
			}
		},
		data: {
			is_main_group: true
		}
	});
	return json({ toast: 'main group changed' });
}

const updateFormerTeam = async (request: Request, userId: number, name: string, from: string, to: string, formerTeamName: string) => {
	await db.formerTeam.update({
		where: {
			user_id_name: {
				user_id: userId,
				name: formerTeamName
			}
		},
		data: {
			name,
			from: new Date(from),
			to: new Date(to)
		}
	});
	return json({ toast: 'updated former team' });
}

const createFormerTeam = async (request: Request, userId: number, name: string, from: string, to: string) => {
	await db.formerTeam.create({
		data: {
			user_id: userId,
			name,
			from: new Date(from),
			to: new Date(to)
		}
	});
	return json({ toast: 'created former team' });
}


const leaveFormerTeam = async (request: Request, userId: number, formerTeamName: string) => {
	await db.formerTeam.delete({
		where: {
			user_id_name: {
				user_id: userId,
				name: formerTeamName
			}
		}
	});
	return json({ toast: 'left former team' });
}

export const action: ActionFunction = async ({ request }) => {
	const user = await checkUserAuth(request);
	const data = await zx.parseForm(request, z.discriminatedUnion('intent', [
		z.object({
			intent: z.literal('UPDATE_GROUP'),
			userId: zx.NumAsString,
			groupId: zx.NumAsString,
			joinedAt: z.string()
		}),
		z.object({
			intent: z.literal('PROMOTE_USER'), groupId: zx.NumAsString, userId: zx.NumAsString, newAdminUserId: z.string()
		}),
		z.object({ intent: z.literal('LEAVE_GROUP'), groupId: zx.NumAsString, userId: zx.NumAsString }),
		z.object({
			intent: z.literal('CHANGE_MAIN_GROUP'),
			userId: zx.NumAsString,
			groupId: zx.NumAsString
		}),
		z.object({
			intent: z.literal('UPDATE_FORMER_TEAM'),
			userId: zx.NumAsString,
			formerTeamName: z.string(),
			from: z.string(),
			to: z.string(),
			name: z.string()
		}),
		z.object({
			intent: z.literal('CREATE_FORMER_TEAM'),
			userId: zx.NumAsString,
			from: z.string(),
			to: z.string(),
			name: z.string()
		}),
		z.object({
			intent: z.literal('LEAVE_FORMER_TEAM'),
			userId: zx.NumAsString,
			formerTeamName: z.string(),
		}),
	]));

	const { userId } = data;
	if (userId !== Number(user.db.id)) {
		throw json({}, 403);
	}

	let headers = undefined
	switch (data.intent) {
		case "PROMOTE_USER": {
			const { newAdminUserId, groupId } = data;
			promoteUser(userId, newAdminUserId, groupId);
			return json({ toast: 'Member promoted' });
		}
		case "LEAVE_GROUP": {
			const { groupId } = data;
			return leaveGroup(request, userId, groupId);
		}
		case "UPDATE_GROUP": {
			const { joinedAt, groupId } = data;
			if (joinedAt) {
				return updateGroup(request, userId, groupId, joinedAt);
			} else {
				throw json({}, 400);
			}
		}
		case "CHANGE_MAIN_GROUP": {
			const { groupId } = data;
			return changeMainGroup(request, userId, groupId);
		}
		case "UPDATE_FORMER_TEAM": {
			const { name, from, to, formerTeamName } = data;
			return updateFormerTeam(request, userId, name, from, to, formerTeamName);
		}
		case "CREATE_FORMER_TEAM": {
			const { name, from, to } = data;
			return createFormerTeam(request, userId, name, from, to);
		}
		case "LEAVE_FORMER_TEAM": {
			const { formerTeamName } = data;
			return leaveFormerTeam(request, userId, formerTeamName);
		}
	}
}
