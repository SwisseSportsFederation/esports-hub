import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, } from "@remix-run/react";
import styles from "./styles/app.css";
import { authenticator } from "~/services/auth.server";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer";


export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SESF Esports Database",
  viewport: "width=device-width,initial-scale=1",
});

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
    <LiveReload/>
    </body>
    </html>
  );
}
