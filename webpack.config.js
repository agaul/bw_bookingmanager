const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [new MiniCssExtractPlugin({
    filename: 'Resources/Public/Css/backend/fullCalendar.css',
  })],
  mode: 'development',
  watch: true,
  entry: './Resources/Private/TypeScript/BackendCalendar.ts',
  output: {
    filename: 'Resources/Public/JavaScript/BackendCalendar.js',
    path: path.resolve(__dirname, '.'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'TYPO3/CMS/Backend': path.resolve(__dirname, 'public/typo3/sysext/backend/Resources/Private/TypeScript'),
      'TYPO3/CMS/Core': path.resolve(__dirname, 'public/typo3/sysext/core/Resources/Private/TypeScript')
    }
  },
};
