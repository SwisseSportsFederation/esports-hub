import React, { PropsWithChildren } from "react";

const ContentPageLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <div className="flex items-center justify-center h-5/6">
        <div className="prose dark:prose-dark p-7 max-w-prose">
          {children}
        </div>
      </div>
    </>
  );
};
export default ContentPageLayout;
