import { useContext } from 'react';
import { ToastContext } from '~/context/toast-provider';

export const useToast = () => useContext(ToastContext);
