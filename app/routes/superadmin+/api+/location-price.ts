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
		return json({ toast: 'Location Price deleted successfully' }, { status: 200 });
	} catch (error: any) {
		console.log(error);
		return json({ toast: `Error deleting location: ${error.message ?? ''}` }, { status: 500 });
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
		return json({ toast: 'Error while reading form data' }, { status: 400 });
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
		return json({ toast: 'Location Price created successfully' }, { status: 200 });
	} catch (error: any) {
		console.log(error);
		return json({ toast: `Error creating location: ${error.message ?? ''}` }, { status: 500 });
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
		return json({ toast: 'Error while reading form data' }, { status: 400 });
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
		return json({ toast: 'Location Price updated successfully' }, { status: 200 });
	} catch (error: any) {
		console.log(error);
		return json({ toast: `Error updating location: ${error.message ?? ''}` }, { status: 500 });
	}
}
