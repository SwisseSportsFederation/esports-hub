import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { getThemeSession } from "~/services/theme.server";
import { isTheme } from "~/context/theme-provider";

export const action = async ({ request }: ActionArgs) => {
  const themeSession = await getThemeSession(request.headers.get("Cookie"));
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");

  if(!isTheme(theme)) {
    return json({
      success: false,
      message: `theme value of ${theme} is not a valid theme`,
    });
  }

  themeSession.setTheme(theme);
  return json(
    { success: true },
    { headers: { "Set-Cookie": await themeSession.commit() } }
  );
};

export const loader = async () => redirect("/", { status: 404 });