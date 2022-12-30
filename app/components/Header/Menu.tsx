import { Link } from "@remix-run/react";

interface IMenuEntry {
  path: string,
  title: string
}

const MenuEntry = ({ path, title }: IMenuEntry) => {
  return <Link to={path} className="block md:inline-block font-bold md:font-normal md:text-base text-xl mb-2 md:mb-0">
    {title}
  </Link>;
};

const Menu = () => {
  return <>
    <MenuEntry path='/wiki/about-us' title='About us'/>
    <MenuEntry path='/contact' title='Contact'/>
  </>;
};

export default Menu;
