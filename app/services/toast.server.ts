import { commitSession, getSession } from "~/services/session.server";

export const createFlashMessage = async (request: Request, message: string) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  session.flash('globalMessage', message);

  return {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  }
};


