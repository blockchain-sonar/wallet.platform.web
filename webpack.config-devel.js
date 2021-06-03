const baseConfig = require("./webpack.config.js");

module.exports = {
	...baseConfig,
	mode: "development",
	devtool: "inline-source-map",
	optimization: {},
	output: {
		...baseConfig.output,
		filename: 'freeton_wallet_platform.devel.js'
	},
};