import H1Nav from "~/components/Titles/H1Nav";
import SocialSelect from "~/components/SocialSelect";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { checkUserAuth } from "~/utils/auth.server";
import { db } from "~/services/db.server";
import type { LoaderFunctionArgs } from "@remix-run/router";

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

export default function() {
  const { socials, user } = useLoaderData<typeof loader>();

  return <div className="mx-3">
    <div className="w-full max-w-prose mx-auto">
      <H1Nav paths={{ small: '/admin/user', big: '/admin', breakpoint: 'lg' }} title='Socials'/>
      <SocialSelect id={Number(user.db.id)} entityType='USER' socials={socials}/>
    </div>
  </div>;
};
