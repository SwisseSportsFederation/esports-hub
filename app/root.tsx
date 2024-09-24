import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  json,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteError
} from "@remix-run/react";
import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import Footer from "~/components/Footer";
import Header from "~/components/Header/Header";
import Icon from "~/components/Icons";
import Toast from "~/components/Notifications/Toast";
import { ThemeBody, ThemeHead, ThemeProvider, useTheme } from "~/context/theme-provider";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
import { getThemeSession } from "~/services/theme.server";
import LinkButton from "./components/Button/LinkButton";
import { ImageProvider } from "./context/image-provider";
import { getImageRoot } from "./services/admin/api/cloudflareImages.server";
import styles from "./styles/tailwind.css?url";
import { ToastProvider } from "./context/toast-provider";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "Swiss Esports Hub" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
  ]
};

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
    imageRoot: getImageRoot()
  }, {
    ...(message && {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    })
  });
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
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
        <Meta />
        <ThemeHead ssrTheme={Boolean(loaderTheme)} />
        <Links />
      </head>
      <body>
        <ToastProvider>
          {message ? <Toast text={message} /> : null}
          <div id="modal-root" />
          <div className='min-h-dvh dark:bg-gray-1 text-color bg-gray-7 flex flex-col'>
            <Header forceWhiteText={forceWhiteText} />
            <main className='min-h-[calc(100vh-11.375rem)] flex flex-col relative'>
              <Outlet />
            </main>
            <Footer forceWhiteText={forceWhiteText} />
          </div>
          <ScrollRestoration />
          <Scripts />
          <ThemeBody ssrTheme={Boolean(loaderTheme)} />
        </ToastProvider>
      </body>
    </html>
  );
}

function AppWithProviders() {
  const { theme, imageRoot } = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={theme}>
      <ImageProvider imageRoot={imageRoot}>
        <App />
      </ImageProvider>
    </ThemeProvider>
  );
}

export default withSentry(AppWithProviders);

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <title>Error!</title>
          <Meta />
          <Links />
        </head>
        <body>
          <div id="modal-root" />
          <div className='min-h-dvh
              dark:bg-gray-1 text-color bg-gray-7 flex flex-col'>
            <div className="flex items-center p-4 md:px-8">
              <Link to={'/'} className="w-full flex justify-center">
                <Icon iconName='logo' className="text-black text-color w-24 h-8 max-h-[40px]" />
              </Link>
            </div>
            <main className='pt-5 min-h-[calc(100vh-13.5rem)] flex flex-col'>
              <div className="pt-10 w-full text-center">
                {error.status} {error.statusText} <br />
                <div className="max-w-lg mt-10 flex justify-center mx-auto">
                  <LinkButton title="Back to home" path={'/'} />
                </div>
              </div>
            </main>
            <Footer forceWhiteText={false} />
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  } else if (error instanceof Error) {
    return (
      <html lang="en">
        <head>
          <title>Error!</title>
          <Meta />
          <Links />
        </head>
        <body>
          <div id="modal-root" />
          <div className='min-h-dvh
              dark:bg-gray-1 text-color bg-gray-7 flex flex-col'>
            <div className="flex items-center p-4 md:px-8">
              <Link to={'/'} className="w-full flex justify-center">
                <Icon iconName='logo' className="text-black text-color w-24 h-8 max-h-[40px]" />
              </Link>
            </div>
            <main className='pt-5 min-h-[calc(100vh-13.5rem)] flex flex-col'>
              <div className="pt-10 w-full text-center">
                {error.message} <br />
                <div className="max-w-lg mt-10 flex justify-center mx-auto">
                  <LinkButton title="Back to home" path={'/'} />
                </div>
              </div>
            </main>
            <Footer forceWhiteText={false} />
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
