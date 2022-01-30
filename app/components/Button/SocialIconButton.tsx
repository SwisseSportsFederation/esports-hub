import Icon from "../Icon";
import React from "react";
import useNotification from "../../hooks/useNotification";
import IEntitySocial from "../../models/IEntitySocial";

interface ISocialIconButtonProps {
  entitySocial: IEntitySocial
}

const SocialIconButton = ({ entitySocial }: ISocialIconButtonProps) => {
  const { addNotification } = useNotification();

  const onClick = () => {
    if(entitySocial.name.includes("http://") || entitySocial.name.includes("https://")) {
      window.open(entitySocial.name);
    } else {
      navigator.clipboard.writeText(entitySocial.name)
        .then(() => {
          addNotification(`${entitySocial.social.name} value copied`, 3000);
        })
        .catch(() => {
          addNotification("Error copying the value", 3000);
        });
    }
  };

  return <>
    <button onClick={onClick} className="mx-3 mb-2">
      <Icon className="w-9 h-9" path={`/assets/${entitySocial.social.name.toLowerCase()}.svg`}/>
    </button>
  </>;
};

export default SocialIconButton;
