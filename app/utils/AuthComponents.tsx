import { Form } from "@remix-run/react";
import Icon from "~/components/Icons";

const Login = (props: { textColor: string }) => <Form action={"/auth/login"} method="post">
  <button>
    <Icon iconName='signIn' className={props.textColor + " p-0 m-0 w-[40px] h-[40px]"}/>
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
