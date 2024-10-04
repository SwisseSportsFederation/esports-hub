import { json } from '@remix-run/node';
import { ManagementClient } from 'auth0';
import { AuthUser } from '~/services/auth.server';
import { db } from '~/services/db.server';

export const updateEmail = async (user: AuthUser, user_id: number, email: string) => {
	const managementClient = new ManagementClient({
		clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
		clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
		domain: process.env.AUTH0_DOMAIN,
	});

	await db.user.update({
		where: {
			id: user_id,
		},
		data: {
			email: email
		}
	});

	console.log('Changing user email for id: ' + user_id)

	const emailChangeResponse = await managementClient.users.update({ id: user.db.auth_id! }, { email: email });
	if (emailChangeResponse.status > 400) {
		// TODO maybe rollback email changes in postgres db
		console.error(emailChangeResponse.statusText)
		throw new Error('Error changing Email for Authentication');
	}
	const emailVerifyResponse = await managementClient.jobs.verifyEmail({ user_id: user.db.auth_id! });
	if (emailVerifyResponse.status > 400) {
		// TODO maybe rollback email changes in postgres db
		console.error(emailVerifyResponse.statusText)
		throw new Error('Error sending verification email');
	}
	return json({}, 200);
}

export const deleteUser = async (user: AuthUser, user_id: number) => {
	const managementClient = new ManagementClient({
		clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
		clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
		domain: process.env.AUTH0_DOMAIN,
	});

	console.log('Deleting user with id: ' + user_id)

	await db.user.delete({
		where: {
			id: user_id,
		},
	});

	return await managementClient.users.delete({ id: user.db.auth_id! });
}
