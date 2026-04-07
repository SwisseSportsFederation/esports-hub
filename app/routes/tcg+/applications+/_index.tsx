import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";
import { checkTcgAdmin, checkUserAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await checkUserAuth(request);
	await checkTcgAdmin(user.db.id);

	const applications = await db.tCGApplication.findMany({
		orderBy: {
			created_at: "desc"
		},
		select: {
			id: true,
			name: true,
			image: true,
			created_at: true,
			checked_main_team: true,
			is_accepted: true,
			user: {
				select: {
					id: true,
					handle: true,
					email: true,
					name: true
				}
			}
		}
	});

	return json({ applications });
}

export default function TcgApplicationsOverview() {
	const { applications } = useLoaderData<typeof loader>();

	return <div className="mx-3 py-7">
		<div className="max-w-6xl w-full mx-auto">
			<div className="flex items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-4xl font-bold mb-2">TCG Applications</h1>
					<p className="text-color">Overview of all submitted Swiss Gaming TCG applications.</p>
				</div>
				<Link to="/tcg" className="rounded-xl bg-gray-3 px-4 py-2 text-color">Back to TCG</Link>
			</div>

			<div className="overflow-x-auto rounded-xl bg-white p-4 dark:bg-gray-2">
				<table className="w-full min-w-[720px] text-left">
					<thead>
						<tr className="border-b border-gray-300 dark:border-gray-4">
							<th className="px-3 py-3">Submitted</th>
							<th className="px-3 py-3">Card Name</th>
							<th className="px-3 py-3">User</th>
							<th className="px-3 py-3">Email</th>
							<th className="px-3 py-3">Main Team</th>
							<th className="px-3 py-3">Accepted</th>
							<th className="px-3 py-3">Details</th>
						</tr>
					</thead>
					<tbody>
						{applications.map((application) => {
							return <tr key={application.id.toString()} className="border-b border-gray-200 last:border-b-0 dark:border-gray-4">
								<td className="px-3 py-3 align-top whitespace-nowrap">{new Date(application.created_at).toLocaleDateString()}</td>
								<td className="px-3 py-3 align-top font-bold">{application.name}</td>
								<td className="px-3 py-3 align-top">{application.user.name || application.user.handle}</td>
								<td className="px-3 py-3 align-top">{application.user.email}</td>
								<td className="px-3 py-3 align-top">{application.checked_main_team ? "Yes" : "No"}</td>
								<td className="px-3 py-3 align-top">{application.is_accepted ? "Accepted" : "Pending"}</td>
								<td className="px-3 py-3 align-top">
									<Link to={`/tcg/applications/${application.id.toString()}`} className="text-red-1 hover:underline">
										Open
									</Link>
								</td>
							</tr>;
						})}
					</tbody>
				</table>
				{applications.length === 0 && <div className="px-3 py-6 text-color">No TCG applications have been submitted yet.</div>}
			</div>
		</div>
	</div>;
}
