import { Form, Link, useLoaderData } from "remix";
import Icon from "../Icon";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
// import ThemeToggle from "../ThemeToggle";
import Menu from "./Menu";

const UserState = () => {
  const data = useLoaderData();

  /* User Icon with Logout and Admin Dropdown */
  if(data.user) {
    return <Form action={"/auth/logout"} method="post">
      <button type="submit" className="cursor-pointer hover:text-red-1">
        <Icon path={'/assets/sign-in.svg'} className='text-black  rotate-180 dark:text-white p-0 m-0 w-[40px] h-[40px]'/>
      </button>
    </Form>;
  }

  /* Sign-in Button */
  return <Form action={"/auth/login"} method="post">
    <button>
      <Icon path={'/assets/sign-in.svg'} className='text-black dark:text-white p-0 m-0 w-[40px] h-[40px]'/>
    </button>
  </Form>;
};

// Safari seems to have an issue with this
// because of overflow-hidden the scroll bar disappears
// -> innerWidth > 768 tailwindcss updates header
const Header = () => {
  const [menuActive, _setMenuActive] = useState<boolean>(false);
  // const router = useRouter();
  const menuActiveRef = useRef(menuActive);

  const setMenuActive = (val: boolean) => {
    _setMenuActive(val);
    menuActiveRef.current = val;
  };

  // close menu when path changes
  // close menu when window size changes
  useEffect(() => {
    const handleRouteChange = () => {
      document.body.classList.remove('overflow-hidden');
      setMenuActive(false);
    };

    const handleResize = () => {
      if(!menuActiveRef.current || window.innerWidth < 768) {
        return;
      }
      document.body.classList.remove('overflow-hidden');
      setMenuActive(false);
    };

    // router.events.on('routeChangeComplete', handleRouteChange);
    window.addEventListener('resize', () => handleResize());
    return () => {
      window.removeEventListener('resize', () => handleResize());
      // router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  // when menu gets toggled:
  //  - add to body the overflow hidden (no scroll)
  //  - scroll to top
  //  - set menu active
  const toggleMenu = () => {
    document.body.classList.toggle('overflow-hidden');
    window.scrollTo(0, 0);
    setMenuActive(!menuActive);
  };
  return <header className='z-50'>
    <nav className='sticky top-0 dark:bg-gray-2 bg-white'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-center justify-between p-4 md:px-8'>
        <Link to={'/'} className='flex-1'>
          <Icon path={'/assets/logo.svg'} className='text-black dark:text-white w-24 h-8 max-h-[40px]'/>
        </Link>
        {/*desktop menu*/}
        <div className='hidden md:flex flex-row space-x-10'>
          <Menu/>
        </div>
        {/* Icons (login/user) + desktop:theme + mobile:hamburger */}
        <div className='flex justify-end space-x-5 flex-1'>
          <UserState/>
          {/*  <div className='hidden md:flex items-center justify-center'>*/}
          {/*    /!*<ThemeToggle/>*!/*/}
          {/*  </div>*/}
          {/*  <a onClick={toggleMenu}*/}
          {/*     className='w-[40px] h-[40px] items-center cursor-pointer flex md:hidden'>*/}
          {/*    <div className={`hamburger m-0 p-0 border-full ${menuActive ? 'active' : ''}`}/>*/}
          {/*  </a>*/}
        </div>
      </div>
    </nav>
    {/*Mobile Menu*/}
    <MobileMenu menuActive={menuActive}/>
  </header>;
};

export default Header;
