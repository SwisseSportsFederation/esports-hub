import { Link, useLocation } from "@remix-run/react";
import classNames from "classnames";

interface IFooterPage {
  name: string,
  url: string
}

// TODO: Add i18n
const pages: IFooterPage[] = [
  { name: "Imprint", url: "/wiki/imprint" },
  { name: "Data Policy", url: "https://sesf.ch/privacy-policy/" },
  { name: "Contact", url: "/contact" },
];

const Footer = (props: { forceWhiteText: boolean }) => {
  const location = useLocation();
  const bg = classNames({
    'bg-transparent': location.pathname === '/',
    'bg-gray-7 dark:bg-gray-1': location.pathname !== "/"
  });
  const linkClasses = classNames({
    'text-white': props.forceWhiteText,
    'text-color': !props.forceWhiteText
  }, 'hover:text-red-1 transition-colors');

  return (
    <footer className={`px-5 pt-4 pb-8 mt-8 ${bg} z-0`}>
      <ul className="flex justify-center w-full">
        {
          pages.map((page: IFooterPage) =>
            <li key={page.name} className="mx-4">
              <Link to={`${page.url}`} target={page.url.includes('https:') ? '_blank' : '_self'} className={linkClasses}>
                {page.name}
              </Link>
            </li>)
        }
      </ul>
    </footer>
  );
};

export default Footer;
