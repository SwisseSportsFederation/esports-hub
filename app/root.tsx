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
  useLoaderData,
  useLocation,
  useRouteError,
  isRouteErrorResponse
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
import { ThemeHead, ThemeBody, ThemeProvider, useTheme } from "~/context/theme-provider";
import { getThemeSession } from "~/services/theme.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "Swiss Esports Database" },
    { viewport: "width=device-width,initial-scale=1" },
  ]};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const userPromise = authenticator.isAuthenticated(request);
  const themeSessionPromise = getThemeSession(cookie);
  const sessionPromise = getSession(cookie);
  const [user, themeSession, session] = await Promise.all([userPromise, themeSessionPromise, sessionPromise]);

  const message = session.get("globalMessage") || null;


  return json({
    message,
    user,
    theme: themeSession.getTheme(),
  }, {
    ...(message && {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    })
  });
}

// @ts-ignore
BigInt.prototype.toJSON = function() {
  return this.toString()
}

function App() {
  const { message, theme: loaderTheme } = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const location = useLocation();
  const forceWhiteText = location.pathname == "/";

  return (
    <html lang="en" className={theme ?? ""}>
    <head>
      <Meta/>
      <ThemeHead ssrTheme={Boolean(loaderTheme)}/>
      <Links/>
    </head>
    <body>
    {message ? <Toast text={message}/> : null}
    <div id="modal-root"/>
    <div className='min-h-screen min-h-[-webkit-fill-available] dark:bg-gray-1 text-color bg-gray-7 flex flex-col'>
      <Header forceWhiteText={forceWhiteText}/>
      <main className='min-h-[calc(100vh-11.375rem)] flex flex-col relative'>
        <Outlet/>
      </main>
      <Footer forceWhiteText={forceWhiteText}/>
    </div>
    <ScrollRestoration/>
    <Scripts/>
    <LiveReload/>
    <ThemeBody ssrTheme={Boolean(loaderTheme)}/>
    </body>
    </html>
  );
}

export default function AppWithProviders() {
  const { theme } = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={theme}>
      <App/>
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
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
            {error.status} {error.statusText} <br/>
            <div className="max-w-lg mt-10 ml-auto mr-auto">
              <LinkButton title="Back to home" path={'/'}/>
            </div>
          </div>
        </main>
        <Footer forceWhiteText={false}/>
      </div>
      <ScrollRestoration/>
      <Scripts/>
      <LiveReload/>
      </body>
      </html>
    );
  }
}
