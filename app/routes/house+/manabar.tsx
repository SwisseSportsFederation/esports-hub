import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { createFlashMessage } from "~/services/toast.server";
import { checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import { Form, json, useLoaderData } from '@remix-run/react';
import LinkButton from "~/components/Button/LinkButton";
import TextInput from "~/components/Forms/TextInput";
import DateInput from "~/components/Forms/DateInput";
import ActionButton from "~/components/Button/ActionButton";
import dateInputStyles from '~/styles/date-input.css?url';
import { Resend } from "resend";

export function links() {
	return [
		{ rel: 'stylesheet', href: dateInputStyles },
	];
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await checkUserAuth(request);
	try {
		const locationName = 'ManaBar'; // TODO get correct name from db
		const locationEmail = 'info@manabar.ch'; // TODO get correct email from db

		const { success, data: formData, error: zodError } = await zx.parseFormSafe(request, {
			userId: z.string(),
			locationId: z.string(),
			from: z.string().date(),
			to: z.string().date(),
			email: z.string(),
			people: z.string(),
			hotel: z.string().optional()
		});

		if (!success) {
			console.log('Form zod error:', zodError);
			const headers = await createFlashMessage(request, 'Error while reading form data');
			return json({}, headers);
		}

		const { data, error } = await resend.emails.send({
			from: 'Esports Hub <noreply@hub.sesf.ch>',
			to: locationEmail,
			subject: `Esports House - Booking request`,
			replyTo: formData.email,
			html: `<h1>Booking request from Esports House</h1>
			<p>Dear ${locationName} team,</p>
			<p>We got a new booking request from the EsportsHub platform for the Esports House project. They would like to book a bootcamp with the following information.</p>
			<p>Booking details:</p>
			<ul>
				<li>User: ${user.db.name} ${user.db.surname}</li>
				<li>Email: ${formData.email}</li>
				<li>Location: ${locationName}</li>
				<li>From: ${new Date(formData.from).toLocaleDateString('de-CH')}</li>
				<li>To: ${new Date(formData.to).toLocaleDateString('de-CH')}</li>
				<li>People: ${formData.people}</li>
				<li>Hotel: ${formData.hotel === 'on' ? 'Yes' : 'No'}</li>
			</ul>
			<p>Please get back to them as soon as possible.</p>
			<p>Best regards,</p>
			<p>SESF Team</p>
			`
		});
		const { data: data2, error: error2 } = await resend.emails.send({
			from: 'Esports Hub <noreply@hub.sesf.ch>',
			to: formData.email,
			subject: `Booking request for ${locationName}`,
			html: `<h1>Booking request for ${locationName}</h1>
			<p>Dear ${user.db.name},</p>
			<p>Thank you for your booking request for ${locationName}. The location will get back to you as soon as possible.</p>
			<p>Booking details:</p>
			<ul>
				<li>Location: ${locationName}</li>
				<li>From: ${new Date(formData.from).toLocaleDateString('de-CH')}</li>
				<li>To: ${new Date(formData.to).toLocaleDateString('de-CH')}</li>
				<li>People: ${formData.people}</li>
				<li>Hotel: ${formData.hotel === 'on' ? 'Yes' : 'No'}</li>
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

	return json({
		loggedIn
	});
}

export default function () {
	const { loggedIn } = useLoaderData<typeof loader>();

	return <div className="mx-3 py-7">
		<div className="max-w-prose lg:max-w-6xl w-full mx-auto">
			<div className="grid grid-cols-2 gap-4 mb-8">
				<div className="col-span-2 lg:col-span-1">
					<img src="https://directus.manabar.ch/assets/854a06a3-a2b8-4c6a-b910-15ee969a867e" alt="House" className="w-full h-80 object-cover rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h1 className="text-4xl font-bold mb-2">ManaBar</h1>
					<p className="mb-2">ManaBar is super. Der «Verein für Aufklärung über Internet und Spielkultur» (Kurzform: VAISk) ist seit 2015 das durchführende Organ für Spielkulturanlässe in Basel. Im 2016 wurde dieser Verein als offizieller Rechtsköper gegründet.
						Der Verein hat sich zum Ziel gesetzt, die Spielkulturszene in Basel zu beleben und zu vereinen, was bisher auch bereits schon in Form von kleineren und grösseren Spielkulturanlässen erfolgt ist, dank der grosszügigen Unterstützung der Christoph Merian Stiftung (CMS).</p>
					<p className="mb-2"><b className="font-bold">Address: </b>Güterstrasse 99, 4053 Basel</p>
					<p className="mb-4"><b className="font-bold">Space: </b> 12 players</p>
					<LinkButton path="https://manabar.ch" target="_blank" title="Website"></LinkButton>
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
						<tr className="hover:bg-gray-6 dark:hover:bg-gray-3">
							<td>PCs</td>
							<td>6</td>
							<td>CHF 300.00</td>
							<td>1 day</td>
						</tr>
						<tr className="hover:bg-gray-6 dark:hover:bg-gray-3">
							<td>PCs Weekend</td>
							<td>6</td>
							<td>CHF 600.00</td>
							<td>2 days</td>
						</tr>
						<tr className="hover:bg-gray-6 dark:hover:bg-gray-3">
							<td>+ Hotel (variable)</td>
							<td>6</td>
							<td>CHF 190.00</td>
							<td>per night</td>
						</tr>
					</tbody>
				</table>
			</div>
			{!loggedIn &&
				<h2 className="mt-8 mb-4 font-bold text-3xl">Login to Book</h2>
			}
			{loggedIn &&
				<div>
					<h2 className="mt-8 mb-4 font-bold text-3xl">Book</h2>
					<Form method="post"
						encType="multipart/form-data">
						<input name="userId" type="hidden" value={String(1)} />{/** TODO add correct ID */}
						<input name="locationId" type="hidden" value={String(123)} />{/** TODO add correct ID */}
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
								<label htmlFor="hotel" className="inline-block text-black dark:text-white">Include Hotel</label>
							</div>
						</div>
						<ActionButton content="Book" type="submit" disabled={false} />
					</Form>
				</div>
			}
		</div>
	</div>;
};
