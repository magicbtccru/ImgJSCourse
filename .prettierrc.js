module.exports = {
  proseWrap: 'always',
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  overrides: [
    {
      files: 'packages/@ImgJSCourse/angular/**',
      options: {
        semi: true,
      },
    },
  ],
}
