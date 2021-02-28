import webpack from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import CssoWebpackPlugin from 'csso-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ROOT_URL = process.env.ROOT_URL || '';
const isProduction = NODE_ENV === 'production';
const nodePath = path.join(__dirname, './node_modules');
const sourcePath = path.join(__dirname, './src/');

interface IConfiguration extends webpack.Configuration {
    devServer?: WebpackDevServerConfiguration;
}

const CONFIG = {
  production: {
    FOLDER: `${__dirname}/build`,
    minifyHTML: {
      removeComments: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeRedundantAttributes: true,
      collapseWhitespace: true,
    },
  },
  development: {
    FOLDER: `${__dirname}/deploy`,
    minifyHTML: {
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeRedundantAttributes: true,
    },
  },
}[NODE_ENV]!;

const cssLoaders = [
  MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
  }
];

const webpackConfig: IConfiguration = {
  entry: {
    app: './src/app.ts',
  },

  //context: sourcePath,
  output: {
    path: CONFIG.FOLDER,
    publicPath: '/',
    filename: `${ROOT_URL}/static/[name].[hash].bundle.js`.replace(/^\//, ''),
  },
  resolve: {
    modules: [
      sourcePath,
      'node_modules',
    ],
    //modulesDirectories: [nodePath],
    extensions: ['.ts', '.js', '.tsx', '.json'],
    // This is default param
    enforceExtension: false,
  },
  mode: isProduction ? 'production' : 'development',
  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        extractComments: false,
        parallel: false,
        terserOptions: {
          sourceMap: false,
          ecma: 2020,
          toplevel: true,
          output: {
            comments: false,
          },
          compress: {
            // https://github.com/mishoo/UglifyJS2/pull/2325
            // eslint-disable-next-line @typescript-eslint/camelcase
            unsafe_methods: true,
            // eslint-disable-next-line @typescript-eslint/camelcase
            unsafe_arrows: true,
            // eslint-disable-next-line @typescript-eslint/camelcase
            drop_console: true,
            passes: 3,
            // eslint-disable-next-line @typescript-eslint/camelcase
            pure_funcs: ['invariant'],
          },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new CssoWebpackPlugin() as any,
    ],
  },
  node: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [nodePath],
        sideEffects: false,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: cssLoaders,
      },
      {
        test: /\.(png|jpg|gif|ico|woff2?|eot)$/,
        loader: 'file-loader',
        options: {
          name: `${ROOT_URL}/static/[hash].[ext]`.replace(/^\//, ''),
        },
      },
    ],
  },
  // devtool: CONFIG.sourceMap,
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head',
      minify: CONFIG.minifyHTML,
      scriptLoading: 'defer'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        ROOT_URL: JSON.stringify(ROOT_URL),
      },
    }),
    new MiniCssExtractPlugin({
      filename: `${ROOT_URL}/static/[hash].css`.replace(/^\//, ''),
      chunkFilename: `${ROOT_URL}/static/[id][hash].css`.replace(/^\//, ''),
    }),
  ],
  devServer: {
    host: 'localhost',
    port: 8080,
    historyApiFallback: true,
    // It suppress error shown in console, so it has to be set to false.
    quiet: false,
    // It suppress everything except error, so it has to be set to false as well
    // to see success build.
    noInfo: false,
    stats: 'minimal',
  },
};

export default webpackConfig;
