import { Form } from "@remix-run/react";
import Icon from "~/components/Icons";

const Login = () => <Form action={"/auth/login"} method="post">
  <button>
    <Icon iconName='signIn' className="text-color p-0 m-0 w-[40px] h-[40px]"/>
  </button>
</Form>;

const Logout = () => <Form action={"/auth/logout"} method="post">
  <button type="submit" className="cursor-pointer hover:text-red-1 w-full px-8">
    Logout
  </button>
</Form>;

export {
  Login,
  Logout
};
