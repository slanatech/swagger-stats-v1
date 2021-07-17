module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['prettier', 'vue'],
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', '@vue/typescript/recommended', '@vue/prettier', '@vue/prettier/@typescript-eslint'],
  rules: {
    'prettier/prettier': 'warn',
  },
}
