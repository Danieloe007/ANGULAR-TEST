const { shareAll } = require('@angular-architects/native-federation/config');

const config = {
  name: 'mfe-transfers',
  exposes: {
    './Component': './src/app/features/transfer/transfer.component.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],
  features: {
    ignoreUnusedDeps: true
  }
};

module.exports = config;
