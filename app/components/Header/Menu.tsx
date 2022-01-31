import { Link } from "remix";

interface IMenuEntry {
  path: string,
  title: string
}

const MenuEntry = ({ path, title }: IMenuEntry) => {
  return <Link to={path} className="font-bold md:text-[20px] text-[24px] ml-[20px]">
    {title}
  </Link>;
};

const Menu = () => {
  return <>
    <MenuEntry path='/search' title='Search'/>
    <MenuEntry path='/wiki/about-us' title='About us'/>
    <MenuEntry path='/contact' title='Contact'/>
  </>;
};

export default Menu;
