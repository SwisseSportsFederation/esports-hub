import { useCallback, useState } from "react";

export default function Background() {
  const [visible, setVisible] = useState(true);

  return <picture className="fixed top-0 left-0 min-w-full min-h-full z-0 ">
    <img className={`absolute z-10 top-0 w-screen h-screen object-cover transition-opacity ${visible ? 'opacity-0' : ''}`} alt="background"
         loading="lazy"
         decoding="async"
         ref={useCallback((img: HTMLImageElement | null) => {
           console.log(img?.complete);
           if(img?.complete) {
             setVisible(false);
           }
         }, [setVisible])}
         onLoad={() => setVisible(false)}
         src="https://imagedelivery.net/-pjDUUB_7zGU0M0_c6dmdw/3dbd38e3-5007-4190-5cb7-ff630d6f2c00/public"
         srcSet={`
          https://imagedelivery.net/-pjDUUB_7zGU0M0_c6dmdw/3dbd38e3-5007-4190-5cb7-ff630d6f2c00/w=256 256w,
          https://imagedelivery.net/-pjDUUB_7zGU0M0_c6dmdw/3dbd38e3-5007-4190-5cb7-ff630d6f2c00/w=512 512w,
          https://imagedelivery.net/-pjDUUB_7zGU0M0_c6dmdw/3dbd38e3-5007-4190-5cb7-ff630d6f2c00/w=1024 1024w,
          https://imagedelivery.net/-pjDUUB_7zGU0M0_c6dmdw/3dbd38e3-5007-4190-5cb7-ff630d6f2c00/w=2048 2048w
        `}
    />
    <img role="presentation" alt='background'
         className={`absolute z-0 top-0 w-full h-full`}
         src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAUFBQUFBQUGBgUICAcICAsKCQkKCxEMDQwNDBEaEBMQEBMQGhcbFhUWGxcpIBwcICkvJyUnLzkzMzlHREddXX0BBQUFBQUFBQYGBQgIBwgICwoJCQoLEQwNDA0MERoQExAQExAaFxsWFRYbFykgHBwgKS8nJScvOTMzOUdER11dff/CABEIAIUAyAMBIgACEQEDEQH/xAAyAAACAwEBAQAAAAAAAAAAAAACAwABBAUGCAEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/9oADAMBAAIQAxAAAAD5KKj9rCQ5zaxi7SNDEqUha870acDIvsbvPvH6BHNu2PO145MomOcyXJFiwIQQoHVYhnr4uqqgAIGLJdjDWJ1Nxk0RaZsiWY2C6BDksUN1KuVJIB1CXDjWkwnUOtLRG1vRz15s9C3PXyafU8xrk6xbee7UPXmeUj1C89/G4fXce155O/C8QsJKZAsRSpZ1E9HLHRjaFa49Xsee6hp6Xfw+pj0Hxu3zVXm8vQ5O3J1Oz5Hep9ro8r0sNt3E6PNpee5PY5F4ZqsUjsLYcGNehziM9CkOReTN3L00u91OD0526eVWWLz8nZz6wUaAI6u/z75r0ieVYXzdeMlNFQVCjBlxHQsKNrSxbzDVmcLs9Th9Na68L87eDHvy3GJehRAFJCMk0hioIVcNlRs0ERkkaSnTUXpXc57lI27+buUa1UgVZ4l72BGC612jCG1QZK0AkDIdBUQ6NUuQBpyNUbUiFAQSg17Mb3i7KaAUBBPQenI4e087HVqaNGdWlLSroAYIDJcCSgKRQdSUU2STQySQQktrXIqFkgmskY05KQJkpIVImIyQ6kiX/8QAHRAAAwEBAQEBAQEAAAAAAAAAAQIDABEEEBIgE//aAAgBAQABAgD5zDDHPm3VZHnVL/70pY0x3Ph+jAAc3SzFj0EMtFuLmtGfH+CCMMMMcSWLMzHDAcwYMWYn+DjuAghiTjuFSvFCoJGBiZlWB/voYN0KIjznzNAzVZrKQ8x8j+SnnpJlO73vz84FNJZRTzHyU8lvO056GkqxfzW814VR/ne/DNlITQMNELOkfTGyAxrC8rfqy+pPQtMfvcyuGytKkbQ9E7tX0H052W0vVH2T9bX9D+k1x+D6Xcvuq8qxrK3+1bXpRi62n6J+oeql7NTH+f2S2O7Ix08TVrM+YZWSi1NHZsf5705vktAzz6uoHDAjAhv2zE7nOc70k/JmLzoXcvmDAjnN0/BgACCOjcIIUzab/tndmY7n5KFSpHAFABDZSu4wbLp5MS7M5bKoT/NkKFPyAPhxylD1s2XTy5mcserky7hBUqV5ukkgq37LErkwZnYn4CjK4fpxDA7v6JJGB6SMuXdJOOO6CGBBxzZsfnd//8QAIhAAAgEEAgIDAQAAAAAAAAAAAAERECEwMUFhIEACUFFg/9oACAEBAAM/AM8kz6sVn1mMfovykYxoeWRsf4P8GuBqqZK0dEcDXBBGORMT4OjojgiqaExNaN2IkjIrCZ8WKNCuQQyBWuI+LQmhXLvHBqiE0JyK5DIZHJ2TyJoTk3jjwtum6QNDXJ2W2TyTl0Osz4tVnHeisKP5Gcyj75jxf//EABoRAQEBAQEBAQAAAAAAAAAAAAEAERACIBL/2gAIAQIBAT8A9mz5smbY9Wzx6+p9T6v1bPBt48y/c+pZ9R64mWw9CyGJL15ghvUkdLYItnrwO5zfgifgskgsmyy23mWRbMNssM9PjbesfJE9/8QAHBEAAwEBAQADAAAAAAAAAAAAAAECERAgAxIw/9oACAEDAQE/AJEx0KhfjnM0UCXUPy5FJMC+McYMSJkqR+Knk0TSKwsTJoqh+KYxEsdFPiY35oYhNI0aH7ddq8J+TRPn1PqYYYZ4qdIkXNNN5vpfj//Z"/>

  </picture>;
}
