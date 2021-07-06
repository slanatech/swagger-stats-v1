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
  plugins: ['prettier'],
  extends: ['eslint:recommended', require.resolve('eslint-config-prettier')],
  rules: {
    'prettier/prettier': 'warn',
  },
};
