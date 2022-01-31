import { json, LoaderFunction } from "remix";
import { checkUserAuth } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  await checkUserAuth(request);
  return json({});
};

export default function() {
  return <div>User</div>;
}