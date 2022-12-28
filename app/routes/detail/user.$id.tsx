import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = ({ params }) => {
  console.log(params);
  return json({});
}

export default function() {
  return <div>user</div>;
}
