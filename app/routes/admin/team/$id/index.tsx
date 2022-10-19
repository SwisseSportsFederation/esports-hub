import { useParams } from "@remix-run/react";

export default function() {
  const params = useParams();
  console.log(params);
  return <div>nested</div>;
}