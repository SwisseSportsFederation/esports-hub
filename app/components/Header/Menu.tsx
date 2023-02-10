import { Link } from "@remix-run/react";

interface IMenuEntry {
  path: string,
  title: string,
  textColor: string
}

const MenuEntry = ({ path, title, textColor }: IMenuEntry) => {
  return <Link to={path} className={textColor + " block md:inline-block font-bold md:font-normal md:text-base text-xl mb-2 md:mb-0"}>
    {title}
  </Link>;
};

const Menu = (props: { forceWhiteText: boolean }) => {
  const textColor = props.forceWhiteText ? "text-white" : "text-color";
  return <>
    <MenuEntry path='/wiki/about-us' title='About us' textColor={textColor}/>
    <MenuEntry path='/contact' title='Contact' textColor={textColor}/>
  </>;
};

export default Menu;
