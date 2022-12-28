import { PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

type ReactPortalPropTypes = {
  wrapperId: string
}

export default function ReactPortal({ children, wrapperId = "react-portal-wrapper" }: PropsWithChildren<ReactPortalPropTypes>) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(wrapperId);
    if(!element) {
      throw new Error("wrapperId cannot be found");
    }
    setWrapperElement(element);
  }, [wrapperId]);

  // wrapperElement state will be null on very first render.
  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
}
