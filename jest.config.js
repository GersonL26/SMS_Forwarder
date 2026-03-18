/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^@dominio/(.*)$': '<rootDir>/src/domain/$1',
    '^@aplicacion/(.*)$': '<rootDir>/src/application/$1',
    '^@infraestructura/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentacion/(.*)$': '<rootDir>/src/presentation/$1',
  },
  collectCoverageFrom: [
    'src/application/**/*.ts',
    '!src/application/**/index.ts',
  ],
  coverageThreshold: {
    'src/application/': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
