import { PropsWithChildren, useEffect, useRef } from "react";
import ReactPortal from "~/components/Notifications/ReactPortal";
import ActionButton from "~/components/Button/ActionButton";
import { CSSTransition } from 'react-transition-group';

type ModalPropTypes = {
  isOpen: boolean,
  handleClose: () => void
};

export default function Modal({ children, isOpen, handleClose }: PropsWithChildren<ModalPropTypes>) {
  const nodeRef = useRef(null);
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => (e.key === "Escape" ? handleClose() : null);
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  return (
    <ReactPortal wrapperId='modal-root'>
      <CSSTransition
        in={isOpen}
        timeout={{ enter: 0, exit: 0 }}
        unmountOnExit
        nodeRef={nodeRef}
      >
        <>
          <div className='absolute left-0 top-0 w-full h-full bg-black/80 z-[51]' onClick={handleClose}/>
          <div ref={nodeRef}
               className='fixed z-[52] flex justify-center items-center h-screen w-screen pointer-events-none'>
            <div className="w-full max-w-sm m-5 p-5 rounded-3xl bg-white dark:bg-gray-2 pointer-events-auto">
              {children}
            </div>
          </div>
        </>
      </CSSTransition>
    </ReactPortal>
  );
}
