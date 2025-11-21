import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { z } from 'zod';
import { zx } from 'zodix';
import { db } from '~/services/db.server';
import { checkSuperAdmin, checkUserAuth } from '~/utils/auth.server';

export let loader: LoaderFunction = () => redirect('/admin');

export const action: ActionFunction = async ({ request }) => {
	const user = await checkUserAuth(request);
	const isSuperAdmin = await checkSuperAdmin(user.db.id);
	if (!isSuperAdmin) {
		throw json({}, 403);
	}

	switch (request.method) {
		case "DELETE":
			return deleteLocation(request);
		case "POST":
			return createLocation(request);
		case "PUT":
			return updateLocation(request);
	}
};

const deleteLocation = async (request: Request) => {
	const { locationId } = await zx.parseForm(request, {
		locationId: z.string()
	});
	try {
		await db.location.delete({
			where: {
				id: BigInt(locationId)
			}
		})
		return json({ toast: 'Location deleted successfully' }, { status: 200 });
	} catch (error: any) {
		console.log(error);
		return json({ toast: `Error deleting location: ${error.message ?? ''}` }, { status: 500 });
	}
}

const createLocation = async (request: Request) => {
	const { success, data, error } = await zx.parseFormSafe(request, {
		name: z.string(),
		slug: z.string(),
		address: z.string(),
		email: z.string(),
		phone: z.string().optional(),
		website: z.string(),
		description: z.string(),
		image: z.string(),
		max_capacity: z.string()
	});
	if (!success) {
		console.log(error);
		return json({ toast: 'Error while reading form data' }, { status: 400 });
	}
	console.log("form data", data);
	const { max_capacity, ...rest } = data;
	try {
		await db.location.create({
			data: {
				...rest,
				max_capacity: Number(max_capacity)
			}
		})
		return json({ toast: 'Location created successfully' }, { status: 200 });
	} catch (error: any) {
		console.log(error);
		return json({ toast: `Error creating location: ${error.message ?? ''}` }, { status: 500 });
	}
}

const updateLocation = async (request: Request) => {
	const { success, data, error } = await zx.parseFormSafe(request, {
		locationId: z.string(),
		name: z.string(),
		slug: z.string(),
		address: z.string(),
		email: z.string(),
		phone: z.string().optional(),
		website: z.string(),
		description: z.string(),
		image: z.string(),
		max_capacity: z.string()
	});
	if (!success) {
		console.log(error);
		return json({ toast: 'Error while reading form data' }, { status: 400 });
	}
	const { max_capacity, locationId, ...rest } = data;
	try {
		await db.location.update({
			where: {
				id: BigInt(locationId)
			},
			data: {
				...rest,
				max_capacity: Number(max_capacity)
			}
		})
		return json({ toast: 'Location updated successfully' }, { status: 200 });
	} catch (error: any) {
		console.log(error);
		return json({ toast: `Error updating location: ${error.message ?? ''}` }, { status: 500 });
	}
}
