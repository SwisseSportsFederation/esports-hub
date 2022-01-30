import { Link } from "remix";

interface IFooterPage {
  name: string,
  url: string
}

// TODO: Add i18n
const pages: IFooterPage[] = [
  { name: "Imprint", url: "/wiki/imprint" },
  { name: "Data Policy", url: "/wiki/data-policy" },
  { name: "Contact", url: "/contact" },
];

const Footer = () => {
  return (
    <footer className="px-5 pt-4 pb-8 mt-16 bg-gray-7 dark:bg-gray-1">
      <ul className="flex justify-center w-full">
        {
          pages.map((page: IFooterPage) =>
            <li key={page.name} className="mx-4">
              <Link to={`${page.url}`} className="hover:text-red-1 transition-colors dark:text-white">
                {page.name}
              </Link>
            </li>)
        }
      </ul>
    </footer>
  );
};

export default Footer;
