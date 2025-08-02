import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { z } from 'zod';
import { zx } from 'zodix';
import { createFlashMessage } from '~/services/toast.server';
import { checkSuperAdmin, checkUserAuth, logout } from '~/utils/auth.server';
import { db } from '~/services/db.server';

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
		const headers = await createFlashMessage(request, 'Location deleted successfully');
		return json({}, { status: 200, ...headers });
	} catch (error: any) {
		console.log(error);
		const headers = await createFlashMessage(request, `Error deleting location: ${error.message ?? ''}`);
		return json({}, { status: 500, ...headers });
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
		const headers = await createFlashMessage(request, 'Error while reading form data');
		return json({}, { status: 400, ...headers });
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
		const headers = await createFlashMessage(request, 'Location created successfully');
		return json({}, { status: 200, ...headers });
	} catch (error: any) {
		console.log(error);
		const headers = await createFlashMessage(request, `Error creating location: ${error.message ?? ''}`);
		return json({}, { status: 500, ...headers });
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
		const headers = await createFlashMessage(request, 'Error while reading form data');
		return json({}, { status: 400, ...headers });
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
		const headers = await createFlashMessage(request, 'Location updated successfully');
		return json({}, { status: 200, ...headers });
	} catch (error: any) {
		console.log(error);
		const headers = await createFlashMessage(request, `Error updating location: ${error.message ?? ''}`);
		return json({}, { status: 500, ...headers });
	}
}
