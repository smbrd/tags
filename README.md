# Dynamic Web Component

A dynamic web component that renders content based on backend configuration. This project demonstrates the creation of a reusable web component that can dynamically render its content based on server-side configuration.

## Features

- Custom web component built with Lit
- Dynamic content rendering based on server configuration
- Mock server for development and testing
- Webpack build system
- Modern JavaScript tooling

## Installation

```bash
npm install
```

## Development

To start the development server:

```bash
npm start
```

To start the mock server (in a separate terminal):

```bash
npm run mock-server
```

The development server will run on `http://localhost:8080` and the mock server on `http://localhost:3000`.

## Building

To build the project for production:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

- `src/` - Source code for the web component
- `dist/` - Build output
- `mock-server.js` - Development mock server
- `webpack.config.js` - Webpack configuration

## Dependencies

- Lit - For web component creation
- Express - For the mock server
- Webpack - For building and development
- Babel - For JavaScript transpilation

## License

MIT 