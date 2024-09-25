import { Form } from "@remix-run/react";
import Icon from "~/components/Icons";

const Login = (props: { textColor: string }) => <Form action={"/auth/login"} method="post">
  <button className="mr-1 flex space-x-4 bg-red-1 rounded-lg p-2 items-center">
    <Icon iconName='user' className={"text-white p-0 m-0 w-6 h-6 md:w-5 md:h-5"} /> <span className="hidden sm:inline-block">Login</span>
  </button>
</Form>;

const Logout = (props: { textColor: string }) => <Form action={"/auth/logout"} method="post">
  <button type="submit" className={props.textColor + "cursor-pointer hover:text-red-1 w-full px-8"}>
    Logout
  </button>
</Form>;

export {
  Login,
  Logout
};
