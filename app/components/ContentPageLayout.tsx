import type { PropsWithChildren } from "react";
import React from "react";

const ContentPageLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <div className="contentpage flex items-center justify-center h-5/6">
        <div className="prose dark:prose-dark p-7 max-w-prose">
          {children}
        </div>
      </div>
    </>
  );
};
export default ContentPageLayout;
