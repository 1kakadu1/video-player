const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[hash].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  target: "web",
  devServer: {
    static: [
      // Simple example
      path.resolve(__dirname, 'dist'),
      // Complex example
      {
        directory: path.resolve(__dirname, 'dist'),
        staticOptions: {},
        // Don't be confused with `dev.publicPath`, it is `publicPath` for static directory
        // Can be:
        // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
        //publicPath: '/static-public-path/',
        serveIndex: true,
        watch: true,
      },
    ],
    compress: true,
    port: 3000,
    host: '0.0.0.0',
    hot: true
    //disableHostCheck: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      // {
      //   test: /\.(svg|woff|woff2|ttf|eot|otf)([\?]?.*)$/,
      //   use: [
      //     {
      //       loader: 'file-loader?name=assets/fonts/[name].[ext]',
      //     },
      //   ],
      // },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: path.resolve(__dirname, 'src', 'assets'),
          to: './assets',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'style-[hash].css',
    }),
  ],
};
