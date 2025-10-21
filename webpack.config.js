const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: path.join(__dirname, "src/main.js"),
    output: {
        path: path.join(__dirname, "public"),
        filename: "bundle.js",
        publicPath: '/',
        clean: true // Clean output directory before build
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public')
        },
        historyApiFallback: true,
        hot: true,
        open: true,
        port: 8080,
        compress: true
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            }
        ]
    },
    plugins: [
        new DashboardPlugin()
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    }
};