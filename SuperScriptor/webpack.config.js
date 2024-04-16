const path = require('path');
const webpack = require('webpack');
const ExtensionReloader = require('webpack-ext-reloader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const { ProvidePlugin } = require('webpack');
// const { ProvidePlugin } = require('webpack');


module.exports = (env, argv) => ({
    // mode: 'development',
    // devtool: 'cheap-module-source-map',
    devtool: false,
    entry: {
        background: './src/background.js',  // Background script entry
        contentScript: './src/content/content.js',  // Content script entry
        // Add other entry points if needed
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',  // Output each entry point to its own file
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            window: path.resolve(path.join(__dirname, 'src/windowMock.js')),
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "manifest.json", to: "manifest.json" },  // Copy your manifest file
                { from: 'src/monaco-editor/editor.html', to: 'editor.html' },
                { from: 'src/monaco-editor/editor.css', to: 'editor.css' },
                { from: 'src/monaco-editor/snippets/sample-script.js', to: 'sample-script.js' },
                { from: 'main.js', to: 'main.js' },
                { from: 'src/monaco-editor/index.js', to: 'index.js' }],
        }),
        argv.mode === 'development'
            ? new ExtensionReloader({
                port: 9090,
                reloadPage: false,
                entries: {
                    contentScript: ['contentScript'],
                    background: 'background'
                },
            })
            : false,
    ].filter(Boolean),
    watch: true,  // Enable Webpack's watch mode
});