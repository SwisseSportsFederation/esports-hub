import Icon from "../Icons";
import type { Social } from "@prisma/client";
// import useNotification from "../../hooks/useNotification";

interface ISocialIconButtonProps {
  entitySocial: Social
}

const SocialIconButton = ({ entitySocial }: ISocialIconButtonProps) => {
  // const { addNotification } = useNotification();

  const onClick = () => {
    if(entitySocial.name.includes("http://") || entitySocial.name.includes("https://")) {
      window.open(entitySocial.name);
    } else {
      navigator.clipboard.writeText(entitySocial.name)
        .then(() => {
          // addNotification(`${entitySocial.social.name} value copied`, 3000);
        })
        .catch(() => {
          // addNotification("Error copying the value", 3000);
        });
    }
  };

  return <button onClick={onClick} className="mx-3 mb-2">
      <Icon iconName={entitySocial.platform.toLowerCase()} className="w-9 h-9"/>
    </button>;
};

export default SocialIconButton;
