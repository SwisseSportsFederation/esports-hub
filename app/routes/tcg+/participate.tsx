import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { z } from "zod";
import { zx } from 'zodix';
import ImageUploadBlock from "~/components/Blocks/ImageUploadBlock";
import ActionButton from "~/components/Button/ActionButton";
import TextareaInput from "~/components/Forms/TextareaInput";
import TextInput from "~/components/Forms/TextInput";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";


export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await checkUserAuth(request);

	return json({
		user
	});
}

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== 'POST') {
		return json({ error: 'Method not allowed' }, { status: 405 });
	}

	// Check if user is logged in
	const user = await checkUserAuth(request);
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { user_id, name, inspiration, imageId, special_traits, comments, checked_main_team, has_data_policy } = await zx.parseForm(request, {
			user_id: zx.NumAsString,
			name: z.string().min(1, 'Name is required'),
			inspiration: z.string().min(1, 'Inspiration is required'),
			imageId: z.string(),
			special_traits: z.string().min(1, 'Special traits are required'),
			comments: z.string().optional().default(''),
			checked_main_team: z.enum(['on']),
			has_data_policy: z.enum(['on'])
		});

		// Create TCG Application
		const tcgApplication = await db.tCGApplication.create({
			data: {
				name,
				user_id: Number(user_id),
				inspiration,
				image: imageId,
				special_traits,
				comments,
				checked_main_team: true,
				has_data_policy: true,
			}
		});

		return json({ success: true, applicationId: tcgApplication.id });
	} catch (error) {
		console.error('Error creating TCG application:', error);
		return json({ error: 'Failed to create application' }, { status: 500 });
	}
}

export default function () {
	const { user } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const hasSubmittedSuccessfully = !!actionData && 'success' in actionData && actionData.success === true;
	let imageId = "";
	let inspiration = "";
	let special_traits = "";
	let comments = "";

	return <div className="mx-3 py-7">
		<div className="max-w-prose lg:max-w-4xl w-full mx-auto">
			<h1 className="text-4xl font-bold mb-2">Be a part of Swiss Gaming TCG</h1>
			{hasSubmittedSuccessfully ? (
				<div className="mt-6 rounded-xl border border-green-600/40 bg-green-100 p-5 text-green-900">
					<div className="text-xl font-bold">Application submitted successfully</div>
					<p className="mt-2">Thanks for participating in Swiss Gaming TCG. We received your application and will review it. You will not be informed of the outcome immediately and might only see the results once the cards are printed. We cannot guarantee that everyone will have a card, since we have a limited number of cards available.</p>
				</div>
			) : (
				<Form method="post" className="grid grid-cols-1 gap-y-6 lg:gap-6"
					encType="multipart/form-data">
					<input name="user_id" type="hidden" value={String(user.db.id)} />
					<TextInput id="name" label={'Name on Card'} defaultValue={""} required={true} />
					<TextareaInput id="inspiration" label="Inspiration" value={inspiration} required={true} />
					<div className="lg:mx-0 mb-6">
						<div className="mb-2 font-bold">Inspiration Image or image of yourself. (Please less than 2MB)</div>
						<ImageUploadBlock path={'images/tcg/'} imageId={imageId} />
					</div>
					<TextareaInput id="special_traits" label="Your Special Traits. Tell us about yourself." value={special_traits} required={true} />
					<TextareaInput id="comments" label="Any other comments or information you'd like to share?" value={comments} />
					<div className="flex relative flex-row-reverse gap-4 justify-end">
						<label htmlFor="checked_main_team">I have checked that my main team/organisation represents the organisation I want to have in the TCG. *</label>
						<input type="checkbox" name="checked_main_team" id="checked_main_team" required />
					</div>
					<div className="flex relative flex-row-reverse gap-4 justify-end">
						<label htmlFor="data-policy">I have read and agree to the <a href='/tcg/policy' target="_blank" className="text-red-1 hover:underline">Swiss Gaming TCG Participation Agreement</a>. *</label>
						<input type="checkbox" name="has_data_policy" id="data-policy" required />
					</div>

					<div className="flex w-full justify-center lg:justify-start">
						<ActionButton content="Submit TCG Application" type="submit" />
					</div>
				</Form>
			)}
		</div>
	</div >;
};
