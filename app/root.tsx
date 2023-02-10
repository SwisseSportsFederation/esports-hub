import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation
} from "@remix-run/react";
import styles from "./styles/app.css";
import { authenticator } from "~/services/auth.server";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer";
import Icon from "~/components/Icons";
import LinkButton from "./components/Button/LinkButton";
import type { LoaderFunctionArgs } from "@remix-run/router";
import { commitSession, getSession } from "~/services/session.server";
import Toast from "~/components/Notifications/Toast";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SESF Esports Database",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const message = session.get("globalMessage") || null;
  return json({
    message,
    user
  }, {
    headers: {
      // only necessary with cookieSessionStorage
      "Set-Cookie": await commitSession(session),
    },
  });
}

// @ts-ignore
BigInt.prototype.toJSON = function() {
  return this.toString()
}

export default function App() {
  const { message } = useLoaderData<typeof loader>()
  const location = useLocation();
  return (
    <html lang="en">
    <head>
      <Meta/>
      <Links/>
    </head>
    <body>
    {
      message ?
        <Toast text={message}/>
        : null
    }
    <div id="modal-root"/>
    <div className='min-h-screen min-h-[-webkit-fill-available]
        dark:bg-gray-1 text-color bg-gray-7 flex flex-col'>
      <Header forceWhiteText={location.pathname == "/"}/>
      <main className='min-h-[calc(100vh-11.375rem)] flex flex-col relative'>
        <Outlet/>
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

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html lang="en">
    <head>
      <title>Error!</title>
      <Meta/>
      <Links/>
    </head>
    <body>
    <div id="modal-root"/>
    <div className='min-h-screen min-h-[-webkit-fill-available]
            dark:bg-gray-1 text-color bg-gray-7 flex flex-col'>
      <div className="flex items-center p-4 md:px-8">
        <Link to={'/'} className="w-full flex justify-center">
          <Icon iconName='logo' className="text-black text-color w-24 h-8 max-h-[40px]"/>
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
