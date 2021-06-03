import { TONClientFacade } from "./TONClientFacade";

interface Platform {
	readonly version: string;
	readonly TONClientFacade: TONClientFacade.Constructor;
}

declare global {
	interface Window {
		"freeton_wallet_platform": Platform;
	}
}

(function () {
	if (window) {
		if (window["freeton_wallet_platform"] === undefined) {
			window["freeton_wallet_platform"] = Object.freeze({
				version: (global as any).__VERSION__,
				TONClientFacade: TONClientFacade,
			});
		} else {
			console.error(`Failure. Cannot link freeton_wallet_platform twice. A freeton_wallet_platform ${window["freeton_wallet_platform"].version} already linked to global window object.`);
		}
	} else {
		console.error("Failure. Cannot link freeton_wallet_platform due global window object is not exist.");
	}
})();
