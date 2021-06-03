# Free TON Wallet Web Platform Binding

This is a facade library to be used in the Web Browsers.

NOTE: The library include Web Assebly [tonclient.wasm](https://github.com/tonlabs/ton-client-js#download-precompiled-binaries) provided by TON Labs.

The library provides several [Dart](https://dart.dev/)/[Flutter](https://flutter.dev/) interop friendly interfaces:

* TONClientFacade - a wrapper over TON Javascript Web SDK https://www.npmjs.com/package/ton-client-web-js
* TBD


The interfaces exposed on global `window` object like:
```js
window["freeton_wallet_platform"] = Object.freeze({
	version: __VERSION__,
	TONClientFacade: TONClientFacade,
	...
});
```

## How To

1. Build
	```shell
	$ git clone https://github.com/freeton-wallet/wallet.platform.web.git
	$ cd wallet.platform.web
	$ npm install
	$ npm run build
	```
2. Check for result
	```shell
	$ tree .dist/
	.dist/
	├── freeton_wallet_platform.devel.js
	├── freeton_wallet_platform.js
	├── freeton_wallet_platform.js.LICENSE.txt
	└── tonclient.wasm

	0 directories, 4 files
	```
3. Load library in your web application
	```html
	<!DOCTYPE html>
	<html>
	...
	<body>
		...
		<script src="freeton_wallet_platform.js" type="application/javascript"></script>
		...
	</body>
	```

## Find Us

* Web https://www.freeton-wallet.org/
* GitHub https://github.com/freeton-wallet
* Telegram Updates https://t.me/orgfreetonwalletupdates
* Telegram Support https://t.me/orgfreetonwallet