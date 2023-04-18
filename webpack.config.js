const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const DIST = path.resolve(__dirname, 'dist');

module.exports = {
  devtool: 'eval-source-map',
  mode: 'development',
  entry: {
    main: './src/index.js',
    request: './src/request.js',
  },
  output: {
    hashFunction: 'xxhash64', // fix for webpack v4 nodejs v18+ compatability; remove when upgraded to webpack 5. https://github.com/webpack/webpack/issues/14532
    path: DIST,
    publicPath: DIST,
  },
  devServer: {
    contentBase: DIST,
    port: 9011,
    writeToDisk: true,
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),

    // for build scripts
    new CopyPlugin({
      patterns: [
        {
          flatten: true,
          from: './src/*',
          globOptions: {
            ignore: ['**/*.js'],
          },
        },
      ],
    }),
  ],
};
