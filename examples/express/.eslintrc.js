module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    'prettier/prettier': 'warn',
  },
};
