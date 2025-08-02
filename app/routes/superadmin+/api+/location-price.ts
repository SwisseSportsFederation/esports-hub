import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { z } from 'zod';
import { zx } from 'zodix';
import { createFlashMessage } from '~/services/toast.server';
import { checkSuperAdmin, checkUserAuth } from '~/utils/auth.server';
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
			return deleteLocationPrice(request);
		case "POST":
			return createLocationPrice(request);
		case "PUT":
			return updateLocationPrice(request);
	}
};

const deleteLocationPrice = async (request: Request) => {
	const { priceId } = await zx.parseForm(request, {
		priceId: z.string()
	});
	try {
		await db.locationPrice.delete({
			where: {
				id: BigInt(priceId)
			}
		})
		const headers = await createFlashMessage(request, 'Location Price deleted successfully');
		return json({}, { status: 200, ...headers });
	} catch (error: any) {
		console.log(error);
		const headers = await createFlashMessage(request, `Error deleting location: ${error.message ?? ''}`);
		return json({}, { status: 500, ...headers });
	}
}

const createLocationPrice = async (request: Request) => {
	const { success, data, error } = await zx.parseFormSafe(request, {
		locationId: z.string(),
		name: z.string(),
		people_count: z.string(),
		price: z.string(),
		duration: z.string(),
	});
	if (!success) {
		console.log(error);
		const headers = await createFlashMessage(request, 'Error while reading form data');
		return json({}, { status: 400, ...headers });
	}
	console.log("form data", data);
	const { price, people_count, locationId, ...rest } = data;
	try {
		await db.locationPrice.create({
			data: {
				...rest,
				price: Number(price),
				people_count: Number(people_count),
				location: {
					connect: {
						id: BigInt(locationId)
					}
				}
			}
		})
		const headers = await createFlashMessage(request, 'Location Price created successfully');
		return json({}, { status: 200, ...headers });
	} catch (error: any) {
		console.log(error);
		const headers = await createFlashMessage(request, `Error creating location: ${error.message ?? ''}`);
		return json({}, { status: 500, ...headers });
	}
}

const updateLocationPrice = async (request: Request) => {
	const { success, data, error } = await zx.parseFormSafe(request, {
		locationId: z.string(),
		priceId: z.string(),
		name: z.string(),
		people_count: z.string(),
		price: z.string(),
		duration: z.string(),
	});
	if (!success) {
		console.log(error);
		const headers = await createFlashMessage(request, 'Error while reading form data');
		return json({}, { status: 400, ...headers });
	}
	const { price, people_count, locationId, priceId, ...rest } = data;
	try {
		await db.locationPrice.update({
			where: {
				id: BigInt(priceId)
			},
			data: {
				...rest,
				price: Number(price),
				people_count: Number(people_count),
				location: {
					connect: {
						id: BigInt(locationId)
					}
				}
			}
		})
		const headers = await createFlashMessage(request, 'Location Price updated successfully');
		return json({}, { status: 200, ...headers });
	} catch (error: any) {
		console.log(error);
		const headers = await createFlashMessage(request, `Error updating location: ${error.message ?? ''}`);
		return json({}, { status: 500, ...headers });
	}
}
