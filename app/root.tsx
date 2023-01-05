import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "@remix-run/react";
import styles from "./styles/app.css";
import dateInputStyles from "./styles/date-input.css";
import { authenticator } from "~/services/auth.server";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer";
import Icon from "~/components/Icons";
import LinkButton from "./components/Button/LinkButton";
import { LoaderFunctionArgs } from "@remix-run/router";

export function links() {
  return [{ rel: "stylesheet", href: styles },{ rel: "stylesheet", href: dateInputStyles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SESF Esports Database",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return json({
    user
  });
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
    <div id="modal-root"/>
    <div className='min-h-screen min-h-[-webkit-fill-available]
        dark:bg-gray-1 dark:text-white bg-gray-7 flex flex-col'>
      <Header/>
      <main className='pt-5 min-h-[calc(100vh-13.5rem)] flex flex-col'>
        <Outlet/>
      </main>
      <Footer/>
      {/*<Notification/>*/}
    </div>
    <ScrollRestoration/>
    <Scripts/>
    <LiveReload/>
    </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html lang="en">
      <head>
        <title>Error!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="modal-root"/>
        <div className='min-h-screen min-h-[-webkit-fill-available]
            dark:bg-gray-1 dark:text-white bg-gray-7 flex flex-col'>
          <div className="flex items-center p-4 md:px-8">
            <Link to={'/'} className="w-full flex justify-center">
              <Icon iconName='logo' className="text-black dark:text-white w-24 h-8 max-h-[40px]"/>
            </Link>
          </div>
          <main className='pt-5 min-h-[calc(100vh-13.5rem)] flex flex-col'>
            <div className="pt-10 w-full text-center">
              {caught.status} {caught.statusText} <br/>
              <div className="max-w-lg mt-10 ml-auto mr-auto">
                <LinkButton title="Back to home" path={'/'}/>
              </div>
            </div>
          </main>
          <Footer/>
        </div>
      <ScrollRestoration/>
      <Scripts/>
      <LiveReload/>
      </body>
    </html>
  );
}
