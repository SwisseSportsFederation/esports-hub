import Icon from "../Icon";
import classNames from "classnames";
// import { useRouter } from "next/router";
import { PropsWithClassName } from "../../utils/PropsWithClassName";
import { useNavigate } from "react-router";

export type IIconButtonProps = {
  icon: "accept" | "add" | "apply" | "clock" | "decline" | "edit" | "remove",
  size?: "small" | "medium" | "large",
} & ({
  action: (() => void),
  path?: never
} | {
  action?: never,
  path: string
}
  | {
  action?: never,
  path?: never
});


const IconButton = ({ icon, action, path, size = "medium", className }: PropsWithClassName<IIconButtonProps>) => {
  const navigate = useNavigate();
  const useHandleClick = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
    action && action();
    if(path) {
      navigate(path, { replace: true });
    }
  };

  const classname = classNames({
    "h-5 w-5": size === "small",
    "h-8 w-8": size === "medium",
    "h-12 w-12": size === "large"
  }, className);

  return (
    <button onClick={useHandleClick}>
      <Icon
        path={`/assets/${icon}.svg`}
        className={`rounded-full align-middle inline ${classname}`}
      />
    </button>
  );
};

export default IconButton;
