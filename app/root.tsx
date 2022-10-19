import type { LoaderFunction, MetaFunction } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import styles from "./styles/tailwind.css";
import contentPageStyles from "~/styles/contentpage.css";
import Footer from "~/components/Footer";
import Header from "~/components/Header/Header";
import { authenticator } from "~/services/auth.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: contentPageStyles }];
}

export const meta: MetaFunction = () => {
  return { title: "SESF Esports Database" };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return json({ user });
}

// @ts-ignore
BigInt.prototype.toJSON = function() {
  return this.toString()
}

export default function App() {
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <Meta/>
      <Links/>
    </head>
    <body>
    <div className='min-h-screen min-h-[-webkit-fill-available]
        dark:bg-gray-1 dark:text-white bg-gray-7 flex flex-col'>
      <Header/>
      <main className='pt-5 min-h-[calc(100vh-13.5rem)] flex flex-col'>
        <Outlet/>
      </main>
      <Footer/>
      {/*<Notification/>*/}
      {/*<Popup/>*/}
    </div>
    <ScrollRestoration/>
    <Scripts/>
    {process.env.NODE_ENV === "development" && <LiveReload/>}
    </body>
    </html>
  );
}
