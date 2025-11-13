import { useEffect } from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useToast } from "../../hooks/useToast";
import type { loader } from "../../root";

export function ToastMessageListener() {
	// Get the message from the loader
	const { message } = useLoaderData<typeof loader>();
	const actionData = useActionData();
	const { add } = useToast();

	// Listen for action data to show toasts from actions
	useEffect(() => {
		if (actionData && typeof actionData === "object" && "toast" in actionData && actionData.toast) {
			add(actionData.toast);
		}
	}, [actionData, add]);

	useEffect(() => {
		if (message) {
			add(message);
		}
		// Only run when message changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message]);

	return null;
}
