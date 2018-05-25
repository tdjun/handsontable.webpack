/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_js = path.resolve(__dirname, 'js');
var dir_html = path.resolve(__dirname, 'html');
var dir_build = path.resolve(__dirname, 'build');

module.exports = {
    entry: {
        autocomplete2: [path.resolve(dir_js, 'autocomplete2.js')],
        mergehotgrid1: [path.resolve(dir_js, 'mergehotgrid1.js')],
        mergehotgrid2: [path.resolve(dir_js, 'mergehotgrid2.js')],
        bundle: [path.resolve(dir_js, 'main.js')]
    },
    output: {
        path: dir_build,
        filename: '[name].js'
    },
    // watchOptions: {
    //     poll: true
    // },
    devServer: {
        contentBase: dir_build,
    },
    module: {
        loaders: [{
            loader: 'babel-loader',
            test: dir_js,
        },{
            test: /\.css$/,
            include: /node_modules/,
            loaders: ['style-loader', 'css-loader'],
        }],
        noParse: [
            path.join(__dirname, "node_modules/handsontable/dist/handsontable.full.js"),
            path.join(__dirname, "node_modules/tree-model/dist/TreeModel-min.js"),
        ]
    },
    resolve: {
        alias: {
            'handsontable': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.js'),
            'handsontable.css': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.css'),
            'handlebars': path.join(__dirname, '/node_modules/handlebars/dist/handlebars'),
            'TreeModel': path.join(__dirname, '/node_modules/tree-model/dist/TreeModel-min.js'),
            'moment': path.join(__dirname, '/node_modules/moment/moment.js'),
            'hot-formula-parser': path.join(__dirname, '/node_modules/hot-formula-parser/dist/formula-parser.js')
        }
    },
    plugins: [
        // Simply copies the files over
        new CopyWebpackPlugin([
            { from: dir_html } // to: output.path
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
        // 한글언어팩만 추가
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ko/)
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
