// @ts-check
/// <reference types="@prettier/plugin-pug/src/prettier" />

/**
 * @type {import('prettier').Options}
 */
const config = {
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,

  plugins: ['@prettier/plugin-pug'],

  pugBracketSpacing: false,
  pugUseTabs: false,
  pugExplicitDiv: true,
  pugSingleQuote: false,
  pugClassNotation: 'attribute',
};

export default config;
