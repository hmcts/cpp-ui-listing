module.exports = {
  // REQUIRED: without this the decorators will fail the template update
  //  by toMatchInlineSnapshot() where you have Mock components
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    '@babel/plugin-proposal-class-properties'
  ],

  sourceMaps: 'inline',
  presets: [['@babel/preset-env']]
};
