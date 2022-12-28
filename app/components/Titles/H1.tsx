import type { PropsWithChildren } from "react";
import type { PropsWithClassName } from "~/utils/PropsWithClassName";

const H1 = ({ children, className = '' }: PropsWithChildren<PropsWithClassName<Record<never, never>>>) => {
  return <h1 className={`font-bold text-xl mb-1 mt-2 ${className}`}>
    {children}
  </h1>;
};

export default H1;
