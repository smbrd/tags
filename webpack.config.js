const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Mock data
const mockConfig = {
  elements: [
    {
      type: 'text',
      content: 'User: ${name}'
    },
    {
      type: 'text',
      content: 'Email: ${email}'
    },
    {
      type: 'button',
      label: 'View Profile',
      action: {
        type: 'custom',
        payload: { userId: '${id}' }
      }
    },
    {
      type: 'link',
      label: 'Visit Website',
      href: '${website}'
    }
  ]
};

const mockData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    website: 'https://example.com/john'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    website: 'https://example.com/jane'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    website: 'https://example.com/bob'
  }
];

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
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Mock /config endpoint
      devServer.app.get('/config', (req, res) => {
        res.json(mockConfig);
      });

      // Mock /data endpoint
      devServer.app.get('/data', (req, res) => {
        res.json(mockData);
      });

      return middlewares;
    }
  }
}; 