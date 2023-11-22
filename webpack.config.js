const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ProvidePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const DIST = path.resolve(__dirname, 'dist');

module.exports = {
  resolve: {
    fallback: {
      assert: require.resolve('assert/'),
      process: require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
    },
  },
  devtool: 'eval-source-map',
  mode: 'development',
  entry: {
    main: './src/index.js',
    request: './src/request.js',
  },
  output: {
    path: DIST,
    publicPath: DIST,
  },
  devServer: {
    client: {
      // This disables the error / warning overlay, which is distracting during
      // local development of the test dapp.
      overlay: false,
    },
    devMiddleware: {
      writeToDisk: true,
    },
    port: 9011,
    static: {
      directory: DIST,
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: ['process/browser'],
    }),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),

    // for build scripts
    new CopyPlugin({
      patterns: [
        {
          from: './src/*',
          globOptions: {
            ignore: ['**/*.js'],
          },
          to: '[name][ext]',
        },
      ],
    }),
  ],
};
