import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth, checkSuperAdmin } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/superadmin");

export const action: ActionFunction = async ({ request }) => {
	const { action, handle: user_handle } = await zx.parseForm(request, {
		action: z.enum(['POST', 'DELETE']),
		handle: z.string()
	});
	const user = await checkUserAuth(request);
	await checkSuperAdmin(user.db.id);

	try {
		if (action === 'POST') {
			await db.user.update({
				where: { handle: user_handle },
				data: { is_tcg_admin: true }
			});
		} else if (action === 'DELETE') {
			await db.user.update({
				where: { handle: user_handle },
				data: { is_tcg_admin: false }
			});
		}
	} catch (error) {
		throw json({}, 400);
	}
	return json({});
};
