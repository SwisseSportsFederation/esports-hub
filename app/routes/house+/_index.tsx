import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from '@remix-run/react';
import { isLoggedIn } from "~/utils/auth.server";
import { db } from "~/services/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const loggedIn = await isLoggedIn(request);

	const locations = await db.location.findMany({
		orderBy: [
			{
				name: 'asc'
			},
		],
		include: {
			prices: true
		}
	})

	return json({
		loggedIn,
		locations
	});
}

function LocationTeaser({ name, address, price, image, showBook, link }: { name: string, address: string, price: string, image: string, showBook: boolean, link: string }) {
	return <a className="col-span-3 lg:col-span-1 bg-white hover:bg-gray-6 dark:bg-gray-2 dark:hover:bg-gray-3 rounded-lg hover:cursor-pointer" href={link}>
		<div className="flex flex-col gap-2">
			<img src={image} alt="House" className="w-full h-64 object-cover rounded-lg" />
		</div>
		<div className="p-4">
			<h2 className="text-3xl font-bold">{name}</h2>
			<p className="text-gray-500">{address}</p>
			<div className="flex flex-wrap justify-end space-y-4 lg:space-y-0 lg:space-x-2 mt-4">
				<p className="bg-orange-400 text-white p-2 rounded-lg">{price}</p>
				{showBook && <button className="bg-red-500 text-white px-4 py-2 rounded w-full lg:w-auto">Book</button>}
			</div>
		</div>
	</a>;
}

export default function () {
	const { loggedIn, locations } = useLoaderData<typeof loader>();

	return <div className="mx-3 py-7">
		<div className="max-w-prose lg:max-w-6xl w-full mx-auto">
			<h1 className="text-4xl font-bold mb-2">Esports House</h1>
			<p className="text-lg">The Esports House project is a project by the Swiss Esports Federation to help esports teams in Switzerland find affordable bootcamp locations. We have partnered with various locations in Switzerland to make this project possible. <b className="font-bold">SESF members gain an additional discount to the packages. <a className="underline text-red-500" href="https://sesf.ch/become-a-member/">Become a SESF member</a></b></p>
			<h2 className="mt-8 mb-4 font-bold text-4xl">Locations</h2>
			<div className="grid grid-cols-3 gap-y-4 lg:gap-12">
				{locations.map((location) => {
					const price = location.prices && location.prices.length > 0 ? `CHF ${location.prices[0].price}/day` : 'on request'
					return <LocationTeaser
						key={location.id}
						name={location.name}
						address={location.address}
						price={price}
						image={location.image}
						showBook={loggedIn}
						link={`/house/${location.slug}`}
					/>
				}
				)}
			</div>
		</div>
	</div>;
};
