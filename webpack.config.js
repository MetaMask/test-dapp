const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const DIST = path.resolve(__dirname, 'dist');

module.exports = {
  resolve: {
    fallback: {
      assert: false,
      stream: false,
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
    devMiddleware: {
      writeToDisk: true,
    },
    port: 9011,
    static: {
      directory: DIST,
    },
  },
  plugins: [
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
