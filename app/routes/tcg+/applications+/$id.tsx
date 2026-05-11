import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zx } from "zodix";
import { useImage } from "~/context/image-provider";
import { db } from "~/services/db.server";
import { checkTcgAdmin, checkUserAuth } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await checkUserAuth(request);
	await checkTcgAdmin(user.db.id);

	if (!params.id) {
		throw new Response("Application ID missing", { status: 400 });
	}

	const application = await db.tCGApplication.findFirstOrThrow({
		where: {
			id: Number(params.id)
		},
		select: {
			id: true,
			name: true,
			inspiration: true,
			image: true,
			special_traits: true,
			comments: true,
			checked_main_team: true,
			has_data_policy: true,
			is_accepted: true,
			is_finished: true,
			drawer: true,
			discord_handle: true,
			created_at: true,
			user: {
				select: {
					id: true,
					handle: true,
					email: true,
					name: true,
					image: true
				}
			}
		}
	});

	return json({ userHandle: user.db.handle, application });
}

export async function action({ request, params }: ActionFunctionArgs) {
	const user = await checkUserAuth(request);
	await checkTcgAdmin(user.db.id);

	if (!params.id) {
		throw new Response("Application ID missing", { status: 400 });
	}

	const { is_accepted, is_finished, drawer, comments } = await zx.parseForm(request, {
		is_accepted: z.enum(["true", "false"]).optional(),
		is_finished: z.enum(["true", "false"]).optional(),
		drawer: z.string().optional(),
		comments: z.string().optional()
	});

	if (comments !== undefined) {
		const updated = await db.tCGApplication.update({
			where: {
				id: Number(params.id)
			},
			data: {
				comments: comments
			},
			select: {
				comments: true
			}
		});
		return json({ success: true, comments: updated.comments });
	} else if (is_accepted) {
		const updated = await db.tCGApplication.update({
			where: {
				id: Number(params.id)
			},
			data: {
				is_accepted: is_accepted === "true",
			},
			select: {
				is_accepted: true,
			}
		});
		return json({ success: true, is_accepted: updated.is_accepted });
	} else if (is_finished) {
		const updated = await db.tCGApplication.update({
			where: {
				id: Number(params.id)
			},
			data: {
				is_finished: is_finished === "true",
			},
			select: {
				is_finished: true,
			}
		});
		return json({ success: true, is_finished: updated.is_finished });
	} else if (drawer) {
		const updated = await db.tCGApplication.update({
			where: {
				id: Number(params.id)
			},
			data: {
				drawer: drawer
			},
			select: {
				drawer: true
			}
		});
		return json({ success: true, drawer: updated.drawer });
	}
}

const DetailField = ({ label, value }: { label: string, value: string }) => {
	return <div className="rounded-xl bg-white p-4 dark:bg-gray-2">
		<div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-5">{label}</div>
		<div className="whitespace-pre-line text-color">{value}</div>
	</div>;
};

export default function TcgApplicationDetail() {
	const { userHandle, application } = useLoaderData<typeof loader>();
	const imageRoot = useImage();
	const fetcher = useFetcher<typeof action>();
	const isSaving = fetcher.state !== "idle";
	const currentAccepted =
		fetcher.formData?.get("is_accepted") === "true"
			? true
			: fetcher.formData?.get("is_accepted") === "false"
				? false
				: Boolean(application.is_accepted);
	const currentFinished =
		fetcher.formData?.get("is_finished") === "true"
			? true
			: fetcher.formData?.get("is_finished") === "false"
				? false
				: Boolean(application.is_finished);

	return <div className="mx-3 py-7">
		<div className="max-w-5xl w-full mx-auto">
			<div className="flex items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-4xl font-bold mb-2">{application.name}</h1>
					<p className="text-color">Submitted by <Link to={`/detail/user/${application.user.handle}`} className="text-red-1">{application.user.name || application.user.handle}</Link> on {new Date(application.created_at).toLocaleString()}</p>
				</div>
				<Link to="/tcg/applications" className="rounded-xl bg-gray-3 px-4 py-2 text-color">Back to overview</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<div className="lg:col-span-1 rounded-xl bg-white p-4 dark:bg-gray-2">
					<div className="aspect-square overflow-hidden rounded-lg bg-gray-3 flex items-center justify-center">
						{application.image ? <img src={imageRoot + application.image} alt={application.name} className="h-full w-full object-cover" /> : <span className="text-color">No image</span>}
					</div>
					<div className="mt-4 space-y-2 text-color">
						<div><span className="font-bold">User:</span> <Link to={`/detail/user/${application.user.handle}`} className="text-red-1">{application.user.name || application.user.handle}</Link></div>
						<div><span className="font-bold">Handle:</span> {application.user.handle}</div>
						<div><span className="font-bold">Email:</span> {application.user.email}</div>
						<div><span className="font-bold">Discord:</span> {application.discord_handle}</div>
						<div><span className="font-bold">Main team confirmed:</span> {application.checked_main_team ? "Yes" : "No"}</div>
						<fetcher.Form method="post" className="flex flex-row-reverse justify-end gap-2 relative">
							<label htmlFor="is_accepted"><span className="font-bold">Accepted</span></label>
							<input
								type="checkbox"
								id="is_accepted"
								name="is_accepted"
								value="true"
								checked={currentAccepted}
								disabled={isSaving}
								onChange={(event) => {
									const formData = new FormData();
									formData.set("is_accepted", String(event.currentTarget.checked));
									fetcher.submit(formData, { method: "post" });
								}}
							/></fetcher.Form>

						<fetcher.Form method="post" className="flex flex-row-reverse justify-end gap-2 relative">
							<label htmlFor="drawer"><span className="font-bold">Drawer {application.drawer ? `(-> ${application.drawer})` : ""}</span></label>
							<input
								type="checkbox"
								id="drawer"
								name="drawer"
								value="true"
								checked={application.drawer !== null}
								disabled={isSaving || application.drawer !== null}
								onChange={(event) => {
									const formData = new FormData();
									formData.set("drawer", userHandle);
									fetcher.submit(formData, { method: "post" });
								}}
							/>
						</fetcher.Form>

						<fetcher.Form method="post" className="flex flex-row-reverse justify-end gap-2 relative">
							<label htmlFor="is_finished"><span className="font-bold">Finished</span></label>
							<input
								type="checkbox"
								id="is_finished"
								name="is_finished"
								value="true"
								checked={currentFinished}
								disabled={isSaving}
								onChange={(event) => {
									const formData = new FormData();
									formData.set("is_finished", String(event.currentTarget.checked));
									fetcher.submit(formData, { method: "post" });
								}}
							/>
						</fetcher.Form>
						{isSaving && <div className="text-sm text-gray-500">Saving...</div>}
					</div>
				</div>

				<div className="lg:col-span-2 space-y-4">
					<DetailField label="Inspiration" value={application.inspiration} />
					<DetailField label="Special Traits" value={application.special_traits} />
					<div className="rounded-xl bg-white p-4 dark:bg-gray-2">
						<div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-5">Comments</div>
						<fetcher.Form method="post">
							<textarea
								name="comments"
								defaultValue={application.comments ?? ""}
								rows={5}
								className="w-full rounded-lg bg-gray-3 p-3 text-color dark:bg-gray-3 resize-y"
								placeholder="No additional comments provided."
							/>
							<button
								type="submit"
								disabled={isSaving}
								className="mt-2 rounded-lg bg-red-1 px-4 py-2 text-white disabled:opacity-50"
							>
								{isSaving ? "Saving..." : "Save"}
							</button>
						</fetcher.Form>
					</div>
				</div>
			</div>
		</div>
	</div >;
}
