import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useLoaderData } from '@remix-run/react';
import { checkTcgAdmin, checkUserAuth, isLoggedIn } from "~/utils/auth.server";
import LinkButton from "~/components/Button/LinkButton";
import ActionButton from "~/components/Button/ActionButton";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const loggedIn = await isLoggedIn(request);
	let isTcgAdmin = false;
	if (loggedIn) {
		const user = await checkUserAuth(request);
		isTcgAdmin = await checkTcgAdmin(user.db.id, false);
	}

	return json({
		loggedIn,
		isTcgAdmin
	});
}

export default function () {
	const { loggedIn, isTcgAdmin } = useLoaderData<typeof loader>();

	return <div className="mx-3 py-7">
		<div className="max-w-prose lg:max-w-6xl w-full mx-auto">
			<h1 className="text-4xl font-bold mb-2">Swiss Gaming TCG</h1>
			{isTcgAdmin && <div className="my-8 bg-gray-3 p-4 rounded-lg"><div className="mb-2 font-bold">Admin only</div><LinkButton path="/tcg/applications" title="View submitted applications" /></div>}
			<div className="grid grid-cols-2 gap-y-4 lg:gap-12 mb-12">
				<div className="col-span-2 lg:col-span-1">
					<h2 className="text-2xl dark:text-white font-bold mb-1">What is Swiss Gaming TCG?</h2>
					<p className="dark:text-white mb-4">Swiss Gaming Trading Card Game is a TCG which includes cards of various Swiss gaming teams, players and tournaments. With this game you can collect cards, trade with other players and compete in offline tournaments. We plan to release it at the SwitzerLAN 2026 if the production goes as planned.</p>
				</div>
				<div className="col-span-2 lg:col-span-1">
					<img src="/assets/tcg/swiss-esports-tcg-4.jpg" alt="Swiss Gaming TCG Promo" className="rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<img src="/assets/tcg/swiss-esports-tcg-3.jpg" alt="Swiss Gaming TCG Promo" className="rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h2 className="text-2xl dark:text-white font-bold mb-1">How can I get a card of me in the TCG?</h2>
					<p className="dark:text-white mb-4">You can be a part of the Swiss Gaming TCG by signing up for an account and filling out the <a href="/tcg/participate">sign-up form</a>. With this you will be added to a pool of players who are eligible to be featured in the TCG. Depending on the amount of players in the pool, we will select a number of players to be featured in the TCG. Please fill it out and fill out your esports hub profile as good as you can, so we can create great cards.</p>
					{loggedIn ? <LinkButton path="/tcg/participate" title="Sign up for Swiss Gaming TCG" /> : <Form action={"/auth/login"} method="post"><ActionButton type="submit" content="Login to sign up for the TCG" /></Form>}
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h2 className="text-2xl dark:text-white font-bold mb-1">Who is behind the project?</h2>
					<p className="dark:text-white mb-4">The Swiss Gaming TCG is a community led project by Lonya and zischler and managed by ERUPT. With the help of various members of the Swiss gaming community, we aim to create a unique and fun trading card game that celebrates Swiss gaming culture. The Swiss Esports Federation, ERUPT, MYI AG and the SwitzerLAN team are also supporting this project.</p>
				</div>
				<div className="col-span-2 lg:col-span-1">
					<img src="/assets/tcg/swiss-esports-tcg-2.jpg" alt="Swiss Gaming TCG Promo" className="rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<img src="/assets/tcg/swiss-esports-tcg-1.jpg" alt="Swiss Gaming TCG Promo" className="rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h2 className="text-2xl dark:text-white font-bold mb-1">Where can I get cards?</h2>
					<p className="dark:text-white mb-4">We plan to give out and sell cards at the SwitzerLAN 2026 if we don't run into production issues. Cards will be available in booster packs of 10 cards each. Presale is currently not planned but please let us know if you are interested via <a href="mailto:tobias.zischler@erupt.ch">email</a></p>
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h2 className="text-2xl dark:text-white font-bold mb-1">How are the cards designed?</h2>
					<p className="dark:text-white mb-4">The art on the cards are hand drawn and made with love by our art team. All the further designs are done by our team with image editing programs. The following image is a work in progress prototype and the design of the cards will look different in the final version.</p>
				</div>
				<div className="col-span-2 lg:col-span-1">
					<img src="/assets/tcg/tcg-render.jpg" alt="Swiss Gaming TCG Promo" className="rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<img src="/assets/tcg/swiss-esports-tcg-forest.jpg" alt="German Forest" className="rounded-lg" />
				</div>
				<div className="col-span-2 lg:col-span-1">
					<h2 className="text-2xl dark:text-white font-bold mb-1">Where are the cards manufactured?</h2>
					<p className="dark:text-white mb-4">We have chosen a German producer to manufacture the cards and boosters as local as possible. This comes at a greater cost, but we will keep the selling price of boosters to standard prices of traditional TCGs.</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-12 justify-center mb-16">
				<img src="/assets/sesf-logo-white-text.svg" alt="SESF Logo" className="h-16 mb-2" />
				<img src="/assets/tcg/erupt.svg" alt="ERUPT Logo" className="h-10 mb-2" />
				<img src="/assets/tcg/myi-logo.svg" alt="MYI Logo" className="h-12 mb-2" />
				<img src="/assets/tcg/switzerlan-logo.png" alt="SwitzerLAN Logo" className="h-14 mb-2" />
			</div>
			<div className="flex justify-center">
				<div className="min-w-60">
					{loggedIn ? <LinkButton path="/tcg/participate" title="Sign up for Swiss Gaming TCG" /> : <Form action={"/auth/login"} method="post"><ActionButton type="submit" content="Login to sign up for the TCG" /></Form>}
				</div>
			</div>
		</div>
	</div >;
};
