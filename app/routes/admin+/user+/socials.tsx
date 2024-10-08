import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { useLoaderData } from "@remix-run/react";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);

  const socials = await db.social.findMany({
    where: {
      user: {
        id: Number(user.db.id)
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  return json({
    socials,
    user
  });
}

export default function () {
  const { socials, user } = useLoaderData<typeof loader>();

  return <div className="w-full max-w-prose mx-auto lg:mx-0">
    <H1Nav paths={{ small: '/admin/user', big: '/admin', breakpoint: 'lg' }} title='Socials' />
    <SocialSelect id={Number(user.db.id)} entityType='USER' socials={socials} />
  </div>;
};
