import Menu from "./Menu";
import PostFormButton from "~/components/Button/FormButton";
import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import ThemeToggle from "../ThemeToggle";

interface IMobileMenu {
  menuActive: boolean;
}

const AuthButtons = () => {
  const { user } = useLoaderData();
  if(user) {
    return <PostFormButton title="Logout" path="/auth/logout"/>;
  }
  return <>
    <PostFormButton title="Login" path="/auth/login"/>
    <PostFormButton title="Register" path="/auth/login?screen_hint=signup"/>
  </>;
};


const MobileMenu = ({ menuActive }: IMobileMenu) => {
  const classes = classNames({
    'translate-x-0': menuActive
  });
  // todo: use CSSTransitions
  return <div className={`absolute w-full min-h-screen overflow-hidden flex flex-col md:hidden
    left-0 top-0 bottom-0 mt-16 transform -translate-x-full dark:bg-gray-2 bg-white
    transition-transform p-2 pt-4 ${classes}`}>
    <div className="ml-[20px]">
      <Menu textColor={menuActive ? "text-black" : "text-color" }/>
    </div>
    <div>
      <div className="ml-[20px] mt-[20px] mb-[27px] flex items-center justify-start w-full">
        <ThemeToggle/>
      </div>
    </div>
    <div className="flex space-x-8 mx-[20px] justify-center">
      <AuthButtons/>
    </div>
  </div>;
};

export default MobileMenu;
