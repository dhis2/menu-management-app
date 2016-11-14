'use strict';

var webpack = require('webpack');
var path = require('path');
var colors = require('colors');

const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;
const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
let dhisConfig;

try {
    dhisConfig = require(dhisConfigPath);
    console.log('\nLoaded DHIS config:');
} catch (e) {
    // Failed to load config file - use default config
    console.warn(`\nWARNING! Failed to load DHIS config:`, e.message);
    console.info('Using default config');
    dhisConfig = {
        baseUrl: 'http://localhost:8080/dhis',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}
console.log(JSON.stringify(dhisConfig, null, 2), '\n');

function bypass(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
    console.log('[PROXY]'.cyan.bold, req.method.green.bold, req.url.magenta, '=>'.dim, opt.target.dim);
}

const webpackConfig = {
    context: __dirname,
    entry: './src/app.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: 'app.js',
        publicPath: 'http://localhost:8081/',
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
            },
        ],
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui'),
        },
    },
    devServer: {
        progress: true,
        colors: true,
        port: 8081,
        host: '0.0.0.0',
        inline: true,
        compress: true,
        proxy: [
            { path: '/api/*', target: dhisConfig.baseUrl, bypass },
            { path: '/dhis-web-commons/**', target: dhisConfig.baseUrl, bypass, },
            { path: '/icons/*', target: dhisConfig.baseUrl, bypass },
            { path: '/i18n/*', target: 'http://0.0.0.0:8081/src', bypass },
            { path: '/css/*', target: 'http://0.0.0.0:8081/build', bypass },
            { path: '/polyfill.min.js', target: 'http://0.0.0.0:8081/node_modules/babel-polyfill/dist', bypass },
        ],
    },
};

if (!isDevBuild) {
    webpackConfig.plugins = [
        // Replace any occurance of process.env.NODE_ENV with the string 'production'
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
            DHIS_CONFIG: JSON.stringify({}),
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            comments: false,
            beautify: true,
            sourceMap: true,
        }),
    ];
} else {
    webpackConfig.plugins = [
        new webpack.DefinePlugin({
            DHIS_CONFIG: JSON.stringify(dhisConfig)
        }),
    ];
}

module.exports = webpackConfig;
