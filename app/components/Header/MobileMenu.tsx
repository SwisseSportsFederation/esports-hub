// import ThemeToggle from "../ThemeToggle";
import Menu from "./Menu";
import ActionButton from "../Button/ActionButton";

// import { useAuth0 } from "@auth0/auth0-react";

interface IMobileMenu {
  menuActive: boolean
}

const AuthButtons = () => {
  // const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  // if (isLoading) {
  //   return null;
  // }
  //
  // if (isAuthenticated) {
  //   return <ActionButton content='Logout' action={logout} className='!max-w-full'/>;
  // }

  return <>
    <ActionButton content='Login' action={() => console.log("login")}/>
    <ActionButton content='Register' action={() =>
      //   loginWithRedirect({
      //   screen_hint: "signup",
      // })
      console.log("signup")
    }/>
  </>;
};

const MobileMenu = ({ menuActive }: IMobileMenu) => {

  return <div className={`absolute w-full h-full overflow-hidden flex flex-col md:hidden
    left-0 top-0 bottom-0 mt-16 dark:bg-gray-2 bg-white transform -translate-x-full
    transition-transform p-2 ${menuActive ? 'translate-x-0' : ''}`}>
    <Menu/>
    <div>
      <div className='ml-[20px] mt-[20px] mb-[27px] flex items-center justify-start w-full'>
        {/*<ThemeToggle/>*/}
      </div>
    </div>
    <div className='flex space-x-8 mx-[20px] justify-center'>
      <AuthButtons/>
    </div>
  </div>;
};

export default MobileMenu;
