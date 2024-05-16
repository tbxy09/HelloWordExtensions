const path = require('path');
const ExtensionReloader = require('webpack-extension-reloader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { cp } = require('fs');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: './background.js', // Replace with the entry point of your extension
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'background.js',
    },
    plugins: [
        new ExtensionReloader(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'manifest.json', to: 'manifest.json' },
                { from: 'lib', to: 'lib' },
                { from: '*.html', to: './' },
                { from: '*.js', to: './', globOptions: { ignore: ['background.js'] } },
                { from: '*.css', to: './' },
            ],
        }),
    ],
    // watch: true,
};