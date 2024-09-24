import { useToast } from "~/hooks/useToast";
import Icon, { IconType } from "../Icons";
import type { Social } from "@prisma/client";

interface ISocialIconButtonProps {
  entitySocial: Social
}

const SocialIconButton = ({ entitySocial }: ISocialIconButtonProps) => {
  const toast = useToast();

  const onClick = () => {
    if (entitySocial.name.includes("http://") || entitySocial.name.includes("https://")) {
      window.open(entitySocial.name);
    } else {
      navigator.clipboard.writeText(entitySocial.name)
        .then(() => {
          toast.add(`${entitySocial.platform} value copied`)
        })
        .catch(() => {
          toast.add('Error copying the value')
        });
    }
  };

  return <button onClick={onClick} className="mx-3 mb-2">
    <Icon iconName={entitySocial.platform.toLowerCase() as IconType} className="w-9 h-9" />
  </button>;
};

export default SocialIconButton;
