import { Link, useLoaderData, useLocation } from "@remix-run/react";
import Icon from "../Icons";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
// import ThemeToggle from "../ThemeToggle";
import Menu from "./Menu";

import { Login, Logout } from '~/utils/AuthComponents';
import classNames from "classnames";

const UserState = () => {
  const data = useLoaderData();
  /* User Icon with Logout and Admin Dropdown */
  if(data.user) {
    return <div className="relative group">
      <Link to="/admin">
        <Icon iconName='user' className="text-color p-0 m-0 w-[40px] h-[40px]"/>
      </Link>
      <div
        className="hidden md:block absolute z-30 bg-white dark:bg-gray-2 py-4 rounded-md top-full right-0 opacity-0
        group-hover:opacity-100">
        <ul className="space-y-2 text-right">
          <li className="cursor-pointer hover:text-red-1 w-full px-8">
            <Link to={'/admin'}>Admin</Link>
          </li>
          <li>
            <Logout/>
          </li>
        </ul>
      </div>
    </div>;
  }

  /* Sign-in Button */
  return <Login/>;
};

const Header = () => {
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
      if(!menuActiveRef.current || window.innerWidth < 768) {
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

  return <header className="sticky top-0 z-50">
    <nav className={bg}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 md:px-8">
        <Link to={'/'}>
          <Icon iconName='logo' className="text-color w-24 h-8 max-h-[40px]"/>
        </Link>
        <div className='flex-1'/>
        {/*desktop menu*/}
        <div className="hidden md:flex flex-row space-x-4">
          <Menu/>
        </div>
        {/* Icons (login/user) + desktop:theme + mobile:hamburger */}
        <div className="flex-none md:ml-8">
          <div className="flex justify-end space-x-5 flex-1">
            <UserState/>
            {/*  <div className='hidden md:flex items-center justify-center'>*/}
            {/*    /!*<ThemeToggle/>*!/*/}
            {/*  </div>*/}
            <button onClick={toggleMenu}
                    className="w-[40px] h-[40px] items-center cursor-pointer flex md:hidden">
              <div className={`hamburger m-0 p-0 border-full ${menuActive ? 'active' : ''}`}/>
            </button>
          </div>
        </div>
      </div>
    </nav>
    {/*Mobile Menu*/}
    <MobileMenu menuActive={menuActive}/>
  </header>;
};

export default Header;
