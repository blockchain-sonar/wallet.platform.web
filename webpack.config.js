const CopyPlugin = require('copy-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');

const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/Main.ts',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.js', '.ts']
	},
	output: {
		auxiliaryComment: 'This is UMD facade library over https://www.npmjs.com/package/ton-client-web-js to be used inside Dart Web/Flutter Web applications.',
		filename: 'freeton_wallet_platform.js',
		library: 'Free TON Wallet Web Platform Binding',
		libraryTarget: 'umd',
		path: path.join(__dirname, '.dist'),
	},
	optimization: {
		minimize: true
	},
	plugins: [
		new DefinePlugin({
			__VERSION__: JSON.stringify(require("./package.json").version)
		}),
		new CopyPlugin({
			patterns: [
				{ from: './node_modules/ton-client-web-js/tonclient.wasm' }
			]
		}),
		new ProvidePlugin({
			Buffer: ['buffer', 'Buffer']
		})
	],
};