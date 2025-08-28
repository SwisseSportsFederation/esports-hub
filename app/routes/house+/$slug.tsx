import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { createFlashMessage } from "~/services/toast.server";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { Form, json, Link, useLoaderData } from '@remix-run/react';
import LinkButton from "~/components/Button/LinkButton";
import TextInput from "~/components/Forms/TextInput";
import DateInput from "~/components/Forms/DateInput";
import ActionButton from "~/components/Button/ActionButton";
import dateInputStyles from '~/styles/date-input.css?url';
import { Resend } from "resend";
import { db } from "~/services/db.server";

export function links() {
	return [
		{ rel: 'stylesheet', href: dateInputStyles },
	];
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await checkUserAuth(request);
	try {
		const { success, data: formData, error: zodError } = await zx.parseFormSafe(request, {
			locationId: z.string(),
			from: z.string().date(),
			to: z.string().date(),
			email: z.string(),
			people: z.string(),
			hotel: z.string().optional(),
			member: z.string().optional()
		});

		if (!success) {
			console.log('Form zod error:', zodError);
			const headers = await createFlashMessage(request, 'Error while reading form data');
			return json({}, headers);
		}

		const location = await db.location.findFirst({
			where: {
				id: BigInt(formData.locationId)
			}
		})
		if (!location) {
			const headers = await createFlashMessage(request, 'Location not found');
			return json({}, headers);
		}
		if (location.email && location.name) {
			const locationInfoMails = [location.email];
			if (formData.member === 'on') {
				locationInfoMails.push('membership@sesf.ch');
			}

			const { data, error } = await resend.emails.send({
				from: 'Esports Hub <noreply@hub.sesf.ch>',
				to: locationInfoMails,
				subject: `Esports House - Booking request`,
				replyTo: formData.email,
				html: `<h1>Booking request from Esports House</h1>
				<p>Dear ${location.name} team,</p>
				<p>We got a new booking request from the EsportsHub platform for the Esports House project. They would like to book a bootcamp with the following information.</p>
				<p>Booking details:</p>
				<ul>
					<li>User: ${user.db.name} ${user.db.surname}</li>
					<li>Email: ${formData.email}</li>
					<li>Location: ${location.name}</li>
					<li>From: ${new Date(formData.from).toLocaleDateString('de-CH')}</li>
					<li>To: ${new Date(formData.to).toLocaleDateString('de-CH')}</li>
					<li>People: ${formData.people}</li>
					<li>Hotel: ${formData.hotel === 'on' ? 'Yes' : 'No'}</li>
					<li>SESF Member: ${formData.member === 'on' ? 'Yes' : 'No'}</li>
				</ul>
				<p>Please get back to them as soon as possible.</p>
				${formData.member === 'on' && '<p>Please contact <a href="mailto:membership@sesf.ch">membership@sesf.ch</a> to check if they are really a SESF member. (Only needed if you have a discounted price for SESF members)</p>'}
				<p>Best regards,</p>
				<p>SESF Team</p>
				`
			});
			const { data: data2, error: error2 } = await resend.emails.send({
				from: 'Esports Hub <noreply@hub.sesf.ch>',
				to: formData.email,
				subject: `Booking request for ${location.name}`,
				html: `<h1>Booking request for ${location.name}</h1>
				<p>Dear ${user.db.name},</p>
				<p>Thank you for your booking request for ${location.name}. The location will get back to you as soon as possible.</p>
				<p>Booking details:</p>
				<ul>
					<li>Location: ${location.name}</li>
					<li>Address: ${location.address}</li>
					<li>From: ${new Date(formData.from).toLocaleDateString('de-CH')}</li>
					<li>To: ${new Date(formData.to).toLocaleDateString('de-CH')}</li>
					<li>People: ${formData.people}</li>
					<li>Hotel: ${formData.hotel === 'on' ? 'Yes' : 'No'}</li>
					<li>SESF Member: ${formData.member === 'on' ? 'Yes' : 'No'}</li>
				</ul>
				<p>Best regards,</p>
				<p>SESF Team</p>
				`
			});

			if (error || error2) {
				console.log(error);
				const headers = await createFlashMessage(request, 'Error while sending email');
				return json({}, headers);
			}
		}
	} catch (error) {
		console.log(error);
		const headers = await createFlashMessage(request, 'Error while sending email');
		return json({}, headers);
	}
	const headers = await createFlashMessage(request, 'Booking request sent');
	return json({}, headers);
};

export async function loader({ request, params }: LoaderFunctionArgs) {
	const loggedIn = await isLoggedIn(request);

	const { slug } = zx.parseParams(params, {
		slug: z.string()
	});
	const location = await db.location.findFirst({
		where: {
			slug
		},
		include: {
			prices: true,
		}
	});

	return json({
		location,
		loggedIn
	});
}

export default function () {
	const { location, loggedIn } = useLoaderData<typeof loader>();

	if (!location) {
		return <div className="mx-3 py-7">
			<div className="max-w-prose lg:max-w-6xl w-full mx-auto">
				<h1 className="text-4xl font-bold mb-2">Location not found</h1>
			</div>
		</div>;
	}
	return <div className="mx-3 py-7">
		<div className="max-w-prose lg:max-w-6xl w-full mx-auto">
			<div className="grid grid-cols-2 gap-4 mb-8">
				<div className="col-span-2 lg:col-span-1">
					<img src={location.image} alt="House" className="w-full h-80 object-cover rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h1 className="text-4xl font-bold mb-2">{location.name}</h1>
					<p className="mb-2">{location.description}</p>
					<p className="mb-2"><b className="font-bold">Address: </b>{location.address}</p>
					<p className="mb-4"><b className="font-bold">Space: </b>{location.max_capacity} players</p>
					{location.website && <LinkButton path={location.website} target="_blank" title="Website"></LinkButton>}
				</div>
			</div>
			<div>
				<h2 className="text-3xl font-bold mb-4">Prices</h2>
				<table className="w-full">
					<thead>
						<tr>
							<th className="text-left">Name</th>
							<th className="text-left">People</th>
							<th className="text-left">Price</th>
							<th className="text-left">Duration</th>
						</tr>
					</thead>
					<tbody>
						{location.prices.map((price) => {
							return <tr key={price.id} className="hover:bg-gray-6 dark:hover:bg-gray-3">
								<td>{price.name}</td>
								<td>{price.people_count}</td>
								<td>CHF {price.price.toFixed(2)}</td>
								<td>{price.duration}</td>
							</tr>;
						})}
					</tbody>
				</table>
			</div>
			{!loggedIn &&
				<Form action={"/auth/login"} method="post" className="mt-8 mb-4 font-bold flex justify-center">
					<ActionButton content="Login to Book" type="submit" />
				</Form>
			}
			{loggedIn &&
				<div>
					<h2 className="mt-8 mb-4 font-bold text-3xl">Book</h2>
					<Form method="post"
						encType="multipart/form-data">
						<input name="locationId" type="hidden" value={String(location.id)} />
						<div className="grid grid-cols-2 gap-6 mb-8">
							<div className="col-span-2 lg:col-span-1">
								<DateInput name='from'
									label='From' value={new Date()}
									min={new Date()} />
							</div>
							<div className="col-span-2 lg:col-span-1">
								<DateInput name='to'
									label='To' value={new Date()}
									min={new Date()} />
							</div>
							<div className="col-span-2 lg:col-span-1">
								<TextInput id="email" label="Email" defaultValue='' placeholder='leeroy.jenkins@example.com' />
							</div>
							<div className="col-span-2 lg:col-span-1">
								<TextInput id="people" label="People" defaultValue='6' />
							</div>
							<div className="col-span-2 flex items-center">
								<div className="mr-2">
									<input type="checkbox" name="hotel" id="hotel" className="mt-1 inline-block w-5 h-5 border-gray-300 rounded shadow-sm focus:border-red-500 focus:ring-red-500" />
								</div>
								<label htmlFor="hotel" className="inline-block text-black dark:text-white">optional: Include Hotel</label>
							</div>
							<div className="col-span-2 flex items-center">
								<div className="mr-2">
									<input type="checkbox" name="member" id="member" className="mt-1 inline-block w-5 h-5 border-gray-300 rounded shadow-sm focus:border-red-500 focus:ring-red-500" />
								</div>
								<label htmlFor="member" className="inline-block text-black dark:text-white">optional: I am an ordinary SESF member. (<Link to="https://sesf.ch/become-a-member/" className="text-red-1">Register here</Link>)</label>
							</div>
						</div>
						<ActionButton content="Book" type="submit" disabled={false} />
					</Form>
				</div>
			}
		</div>
	</div>;
};
