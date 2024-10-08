import { Link } from "@remix-run/react";

interface ILinkButton {
  path: string,
  title: string
}

const LinkButton = ({ path, title }: ILinkButton) => {
  return <Link to={path} className="w-full max-w-xxs flex items-center justify-center rounded-xl bg-red-1 text-color
  py-2 whitespace-nowrap">
    {title}
  </Link>;
};

export default LinkButton;
