import { ReactNode, createContext, useContext } from 'react';

const EnvContext = createContext("");

export const ImageProvider = ({ children, imageRoot }: {
	children: ReactNode;
	imageRoot: string;
  }) => {
  return <EnvContext.Provider value={imageRoot}>{children}</EnvContext.Provider>;
};

export const useImage = () => useContext(EnvContext);
