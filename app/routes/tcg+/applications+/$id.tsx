import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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

	return json({ application });
}

const DetailField = ({ label, value }: { label: string, value: string }) => {
	return <div className="rounded-xl bg-white p-4 dark:bg-gray-2">
		<div className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-5">{label}</div>
		<div className="whitespace-pre-line text-color">{value}</div>
	</div>;
};

export default function TcgApplicationDetail() {
	const { application } = useLoaderData<typeof loader>();
	const imageRoot = useImage();

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
						<div><span className="font-bold">Main team confirmed:</span> {application.checked_main_team ? "Yes" : "No"}</div>
						<div><span className="font-bold">Policy accepted:</span> {application.has_data_policy ? "Yes" : "No"}</div>
					</div>
				</div>

				<div className="lg:col-span-2 space-y-4">
					<DetailField label="Inspiration" value={application.inspiration} />
					<DetailField label="Special Traits" value={application.special_traits} />
					<DetailField label="Comments" value={application.comments || "No additional comments provided."} />
				</div>
			</div>
		</div>
	</div>;
}
