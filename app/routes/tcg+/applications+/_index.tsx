import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import IconButton from "~/components/Button/IconButton";
import { db } from "~/services/db.server";
import { checkSuperAdmin, checkTcgAdmin, checkUserAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await checkUserAuth(request);
	await checkTcgAdmin(user.db.id);
	const isSuperAdmin = await checkSuperAdmin(user.db.id, false);

	const applications = await db.tCGApplication.findMany({
		orderBy: {
			created_at: "desc"
		},
		select: {
			id: true,
			name: true,
			image: true,
			created_at: true,
			discord_handle: true,
			checked_main_team: true,
			is_accepted: true,
			drawer: true,
			user: {
				select: {
					id: true,
					handle: true,
					name: true
				}
			}
		}
	});

	return json({ applications, isSuperAdmin });
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await checkUserAuth(request);
	await checkSuperAdmin(user.db.id);

	const formData = await request.formData();
	const id = formData.get("id");
	const task = formData.get("task");
	if (!id) {
		throw new Response("Application ID missing", { status: 400 });
	}

	if (task === "delete") {
		await db.tCGApplication.delete({
			where: { id: Number(id) }
		});
	}

	return json({ success: true });
}

export default function TcgApplicationsOverview() {
	const { applications, isSuperAdmin } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const [filters, setFilters] = useState({
		submitted: "",
		name: "",
		user: "",
		discord: "",
		mainTeam: "",
		accepted: "",
		drawer: "",
	});

	function setFilter(key: keyof typeof filters, value: string) {
		setFilters(prev => ({ ...prev, [key]: value }));
	}

	const filtered = applications.filter(app => {
		const dateStr = new Date(app.created_at).toLocaleDateString();
		const userName = app.user.name || app.user.handle;
		if (filters.submitted && !dateStr.toLowerCase().includes(filters.submitted.toLowerCase())) return false;
		if (filters.name && !app.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
		if (filters.user && !userName.toLowerCase().includes(filters.user.toLowerCase())) return false;
		if (filters.discord && !(app.discord_handle ?? "").toLowerCase().includes(filters.discord.toLowerCase())) return false;
		if (filters.mainTeam !== "" && filters.mainTeam !== "all") {
			const expected = filters.mainTeam === "yes";
			if (app.checked_main_team !== expected) return false;
		}
		if (filters.accepted !== "" && filters.accepted !== "all") {
			const expected = filters.accepted === "accepted";
			if (app.is_accepted !== expected) return false;
		}
		if (filters.drawer && !(app.drawer ?? "").toLowerCase().includes(filters.drawer.toLowerCase())) return false;
		return true;
	});

	const inputClass = "w-full mt-1 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm font-normal dark:border-gray-4 focus:outline-none focus:ring-1 focus:ring-red-1";
	const selectClass = inputClass;

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
				<div className="mb-3">Showing {filtered.length} of {applications.length} applications. (Accepted cards: {applications.filter(app => app.is_accepted).length})</div>
				<table className="w-full min-w-[720px] text-left">
					<thead>
						<tr className="border-b border-gray-300 dark:border-gray-4">
							<th className="px-3 py-3">
								Submitted
								<input className={inputClass} placeholder="Filter..." value={filters.submitted} onChange={e => setFilter("submitted", e.target.value)} />
							</th>
							<th className="px-3 py-3">
								Card Name
								<input className={inputClass} placeholder="Filter..." value={filters.name} onChange={e => setFilter("name", e.target.value)} />
							</th>
							<th className="px-3 py-3">
								User
								<input className={inputClass} placeholder="Filter..." value={filters.user} onChange={e => setFilter("user", e.target.value)} />
							</th>
							<th className="px-3 py-3">
								Discord
								<input className={inputClass} placeholder="Filter..." value={filters.discord} onChange={e => setFilter("discord", e.target.value)} />
							</th>
							<th className="px-3 py-3">
								Accepted
								<select className={selectClass} value={filters.accepted} onChange={e => setFilter("accepted", e.target.value)}>
									<option value="all">All</option>
									<option value="accepted">Accepted</option>
									<option value="pending">Pending</option>
								</select>
							</th>
							<th className="px-3 py-3">
								Drawer
								<input className={inputClass} placeholder="Filter..." value={filters.drawer} onChange={e => setFilter("drawer", e.target.value)} />
							</th>
							<th className="px-3 py-3">Details</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((application) => {
							return <tr key={application.id.toString()} className="border-b border-gray-200 last:border-b-0 dark:border-gray-4">
								<td className="px-3 py-3 align-top whitespace-nowrap">{new Date(application.created_at).toLocaleDateString()}</td>
								<td className="px-3 py-3 align-top font-bold">{application.name}</td>
								<td className="px-3 py-3 align-top">{application.user.name || application.user.handle}</td>
								<td className="px-3 py-3 align-top">{application.discord_handle}</td>
								<td className={"px-3 py-3 align-top" + (application.is_accepted ? " text-green-500" : " text-yellow-500")}>{application.is_accepted ? "Accepted" : "Pending"}</td>
								<td className="px-3 py-3 align-top">{application.drawer}</td>
								<td className="px-3 py-3 align-top">
									<div className="flex gap-2 justify-end">
										<IconButton path={`/tcg/applications/${application.id.toString()}`} icon="edit" type="link" />
										{isSuperAdmin && (
											<IconButton
												action={() => {
													if (confirm(`Delete application "${application.name}"?`)) {
														const formData = new FormData();
														formData.set("id", application.id.toString());
														formData.set("task", "delete");
														fetcher.submit(formData, { method: "post" });
													}
												}}
												icon="remove"
												type="button"
											/>
										)}
									</div>
								</td>
							</tr>;
						})}
					</tbody>
				</table>
				{filtered.length === 0 && <div className="px-3 py-6 text-color">No applications match the current filters.</div>}
			</div>
		</div>
	</div>;
}
