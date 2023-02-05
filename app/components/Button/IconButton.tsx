import classNames from "classnames";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";
import { Link } from "@remix-run/react";
import Icon from "~/components/Icons";

export type IIconButtonProps = {
  icon: "accept" | "add" | "apply" | "clock" | "decline" | "edit" | "remove" | "star",
  size?: "small" | "medium" | "large",
  type: "submit" | 'link' | 'button'
} & ({
  type: 'button',
  action: (() => void),
  path?: never,
  name?: never,
  value?: never

} | {
  type: 'link'
  action?: never,
  path: string,
  name?: never,
  value?: never

} | {
  type: 'submit',
  action?: never,
  path?: never,
  name?: string,
  value?: string
});


const IconButton = (props: PropsWithClassName<IIconButtonProps>) => {
  const { icon, action, path, size = "medium", className, type, name, value } = props;
  const useHandleClick = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
    action?.();
  };

  const classname = classNames({
    "h-5 w-5": size === "small",
    "h-8 w-8": size === "medium",
    "h-12 w-12": size === "large"
  }, className);

  const core = <Icon iconName={icon} className={`rounded-full align-middle inline ${classname}`}/>;

  if(type === 'submit') {
    return <button type='submit' name={name} value={value}>
      {core}
    </button>;
  }

  if(type === 'link') {
    return <Link to={path}>
      {core}
    </Link>;
  }

  return <button onClick={useHandleClick}>
    {core}
  </button>;
};

export default IconButton;
