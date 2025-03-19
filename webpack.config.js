const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8080,
    hot: false,
    liveReload: false,
    client: false,
    webSocketServer: false,
    historyApiFallback: true,
    proxy: {
      '/data': {
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true
      },
      '/config': {
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true
      }
    }
  }
}; 