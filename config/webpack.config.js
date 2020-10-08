const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const AmdWebpackPLugin = require('amd-webpack-plugin')

const rootPath = path.join(__dirname, '..')
const pathApp = path.join(rootPath, 'src')
const libDir = path.join(rootPath, 'lib')

module.exports = {
    stats: 'errors-only',
    entry: {
        index: './src/index.tsx'
    },
    mode: 'production',
    output: {
        filename: '[name].js',
        path: libDir,
        library: 'react-animated-number-ts',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        modules: [
            pathApp,
            'node_modules',
        ],
        alias: {
            '~': `${pathApp}`,
            'styles': `${pathApp}/styles`
        },
    },
    plugins: [
        new AmdWebpackPLugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: 'style.css',
        }),
    ],
    externals: {
        react: 'react',
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]__[local]__[hash:base64:5]',
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
        ],
    },
}