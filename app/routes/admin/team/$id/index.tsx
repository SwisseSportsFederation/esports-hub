import { useParams } from "remix";

export default function() {
  const params = useParams();
  console.log(params);
  return <div>nested</div>;
}