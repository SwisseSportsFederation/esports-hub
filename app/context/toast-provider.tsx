import { Context, createContext, PropsWithChildren } from 'react';
import { useMemo, useState } from 'react';
import Toast from '~/components/Notifications/Toast';

export const ToastContext: Context<any> = createContext(undefined);

interface ToastItem {
	id: string,
	text: string
}

// Create a random ID
function generateUEID() {
	return ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3);
}

export const ToastProvider = ({ children }: PropsWithChildren<{}>) => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const add = (text: string) =>
		setToasts((currentToasts: ToastItem[]) => [
			...currentToasts,
			{ id: generateUEID(), text },
		]);
	const close = (id: string) =>
		setToasts((currentToasts) =>
			currentToasts.filter((toast) => toast.id !== id)
		);
	const contextValue = useMemo(() => ({ add }), []);

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<div className="toasts-wrapper">
				{toasts.map((toast) => (
					<Toast key={toast.id} text={toast.text}>
					</Toast>
				))}
			</div>
		</ToastContext.Provider>
	);
};
