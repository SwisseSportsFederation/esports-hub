import { Link, useLoaderData, useLocation } from "@remix-run/react";
import Icon from "../Icons";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "../ThemeToggle";
import Menu from "./Menu";

import { Login, Logout } from '~/utils/AuthComponents';
import classNames from "classnames";

const UserState = (props: { textColor: string }) => {
  const data = useLoaderData();
  /* User Icon with Logout and Admin Dropdown */
  if (data.user) {
    return <div className="relative group mr-1">
      <Link to="/admin">
        <Icon iconName='user' className={props.textColor + " p-0 m-0 w-[32px] h-[32px]"} />
      </Link>
      <div
        className="hidden md:block absolute z-30 bg-white dark:bg-gray-2 py-4 rounded-md top-full right-0 opacity-0
        group-hover:opacity-100">
        <ul className="space-y-2 text-right">
          <li className="cursor-pointer hover:text-red-1 w-full px-8">
            <Link to={'/admin'}>Admin</Link>
          </li>
          <li>
            <Logout textColor={props.textColor} />
          </li>
        </ul>
      </div>
    </div>;
  }

  /* Sign-in Button */
  return <Login textColor={props.textColor} />;
};

const Header = (props: { forceWhiteText: boolean }) => {
  const [menuActive, _setMenuActive] = useState<boolean>(false);
  const location = useLocation();
  const menuActiveRef = useRef(menuActive);

  const setMenuActive = (val: boolean) => {
    _setMenuActive(val);
    menuActiveRef.current = val;
  };

  useEffect(() => {
    document.body.classList.remove('overflow-hidden');
    setMenuActive(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (!menuActiveRef.current || window.innerWidth < 768) {
        return;
      }
      document.body.classList.remove('overflow-hidden');
      setMenuActive(false);
    };
    window.addEventListener('resize', () => handleResize());
    return () => {
      window.removeEventListener('resize', () => handleResize());
    };
  }, []);

  const toggleMenu = () => {
    document.body.classList.toggle('overflow-hidden');
    setMenuActive(!menuActive);
  };

  const bg = classNames('transition-all', {
    'bg-transparent': location.pathname === '/',
    'dark:bg-gray-2 bg-white': location.pathname !== "/" || (menuActiveRef.current && location.pathname === '/'),
  });

  const textColor: string = props.forceWhiteText && !menuActive ? "text-white" : "text-color";
  const hamburgerColorModifier: string = props.forceWhiteText ? "light-mode-dark-background" : "";

  return <header className="sticky top-0 z-50">
    <nav className={bg}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 md:px-8">
        <Link to={'/'} className="relative">
          <Icon iconName='logo' className={textColor + " w-full h-20 max-h-[60px]"} />
          <span className="text-white text-xs absolute bottom-3 right-2 bg-red-500 p-1 rounded-md">BETA</span>
        </Link>
        <div className='flex-1' />
        {/*desktop menu*/}
        <div className="hidden md:flex flex-row space-x-4">
          <Menu textColor={textColor} />
        </div>
        {/* Icons (login/user) + desktop:theme + mobile:hamburger */}
        <div className="flex-none md:ml-8">
          <div className="flex justify-end space-x-5 flex-1">
            <UserState textColor={textColor} />
            <div className='hidden md:flex items-center justify-center'>
              <ThemeToggle />
            </div>
            <button onClick={toggleMenu}
              className="w-[40px] h-[40px] items-center cursor-pointer flex md:hidden">
              <div className={`hamburger m-0 p-0 border-full ${menuActive ? 'active' : ''} ${hamburgerColorModifier}`} />
            </button>
          </div>
        </div>
      </div>
    </nav>
    {/*Mobile Menu*/}
    <MobileMenu menuActive={menuActive} />
  </header>;
};

export default Header;
