/* eslint-disable quote-props */

'use strict'

const svgPresentationAttributes = [
  'alignment-baseline', 'baseline-shift', 'class', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolatio', 'color-interpolatio-filters', 'color-profile', 'color-rendering', 'cursor', 'direction', 'display', 'dominant-baseline', 'enable-background', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'image-rendering', 'kerning', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'overflow', 'pointer-events', 'shape-rendering', 'stop-color', 'stop-opacity', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'transform', 'transform-origin', 'unicode-bidi', 'vector-effect', 'visibility', 'word-spacing', 'writing-mod',
]

module.exports = {
  root: true,
  extends: ['transloadit', 'prettier'],
  env: {
    es6: true,
    jest: true,
    node: true,
    // extra:
    browser: true,
  },
  globals: {
    globalThis: true,
    hexo: true,
    window: true,
  },
  plugins: [
    '@babel/eslint-plugin',
    'jest',
    'markdown',
    'node',
    'prefer-import',
    'promise',
    'react',
    // extra:
    'compat',
    'jsdoc',
    'no-only-tests',
    'unicorn',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 2022,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // transloadit rules we are actually ok with in the ImgJSCourse repo
    'import/extensions': 'off',
    'object-shorthand': ['error', 'always'],
    'strict': 'off',
    'key-spacing': 'off',
    'max-classes-per-file': ['error', 2],
    'react/no-unknown-property': ['error', {
      ignore: svgPresentationAttributes,
    }],

    // Special rules for CI:
    ...(process.env.CI && {
      // Some imports are available only after a full build, which we don't do on CI.
      'import/no-unresolved': 'off',
    }),

    // rules we want to enforce
    'array-callback-return': 'error',
    'func-names': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-extraneous-dependencies': 'error',
    'max-len': 'error',
    'no-empty': 'error',
    'no-bitwise': 'error',
    'no-continue': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'error',
    'no-restricted-properties': 'error',
    'no-return-assign': 'error',
    'no-underscore-dangle': 'error',
    'no-unused-expressions': 'error',
    'no-unused-vars': 'error',
    'no-useless-concat': 'error',
    'no-var': 'error',
    'node/handle-callback-err': 'error',
    'prefer-destructuring': 'error',
    'prefer-spread': 'error',
    'unicorn/prefer-node-protocol': 'error',

    'react/button-has-type': 'error',
    'react/forbid-prop-types': 'error',
    'react/no-access-state-in-setstate': 'error',
    'react/no-array-index-key': 'error',
    'react/no-deprecated': 'error',
    'react/no-this-in-sfc': 'error',
    'react/no-will-update-set-state': 'error',
    'react/prefer-stateless-function': 'error',
    'react/sort-comp': 'error',
    'react/style-prop-object': 'error',

    // accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/control-has-associated-label': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/media-has-caption': 'error',
    'jsx-a11y/mouse-events-have-key-events': 'error',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',

    // compat
    'compat/compat': ['error'],

    // jsdoc
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-examples': 'off', // cannot yet be supported for ESLint 8, see https://github.com/eslint/eslint/issues/14745
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-syntax': 'error',
    'jsdoc/check-tag-names': ['error', { jsxTags: true }],
    'jsdoc/check-types': 'error',
    'jsdoc/newline-after-description': 'error',
    'jsdoc/valid-types': 'error',
    'jsdoc/check-indentation': ['off'],
  },

  settings: {
    'import/core-modules': ['tsd'],
    react: {
      pragma: 'h',
    },
    jsdoc: {
      mode: 'typescript',
    },
    polyfills: [
      'Promise',
      'fetch',
      'Object.assign',
      'document.querySelector',
    ],
  },

  overrides: [
    {
      files: [
        '*.jsx',
        '*.tsx',
        'packages/@ImgJSCourse/react-native/**/*.js',
      ],
      parser: 'espree',
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {
        'no-restricted-globals': [
          'error',
          {
            name: '__filename',
            message: 'Use import.meta.url instead',
          },
          {
            name: '__dirname',
            message: 'Not available in ESM',
          },
          {
            name: 'exports',
            message: 'Not available in ESM',
          },
          {
            name: 'module',
            message: 'Not available in ESM',
          },
          {
            name: 'require',
            message: 'Use import instead',
          },
        ],
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
    {
      files: [
        '*.mjs',
        'e2e/clients/**/*.js',
        'examples/aws-companion/*.js',
        'examples/aws-php/*.js',
        'examples/bundled/*.js',
        'examples/custom-provider/client/*.js',
        'examples/digitalocean-spaces/*.js',
        'examples/multiple-instances/*.js',
        'examples/node-xhr/*.js',
        'examples/php-xhr/*.js',
        'examples/python-xhr/*.js',
        'examples/react-example/*.js',
        'examples/redux/*.js',
        'examples/transloadit/*.js',
        'examples/transloadit-markdown-bin/*.js',
        'examples/xhr-bundle/*.js',
        'private/dev/*.js',
        'private/release/*.js',
        'private/remark-lint-ImgJSCourse/*.js',

        // Packages that have switched to ESM sources:
        'packages/@ImgJSCourse/audio/src/**/*.js',
        'packages/@ImgJSCourse/aws-s3-multipart/src/**/*.js',
        'packages/@ImgJSCourse/aws-s3/src/**/*.js',
        'packages/@ImgJSCourse/box/src/**/*.js',
        'packages/@ImgJSCourse/companion-client/src/**/*.js',
        'packages/@ImgJSCourse/compressor/src/**/*.js',
        'packages/@ImgJSCourse/core/src/**/*.js',
        'packages/@ImgJSCourse/dashboard/src/**/*.js',
        'packages/@ImgJSCourse/drag-drop/src/**/*.js',
        'packages/@ImgJSCourse/drop-target/src/**/*.js',
        'packages/@ImgJSCourse/dropbox/src/**/*.js',
        'packages/@ImgJSCourse/facebook/src/**/*.js',
        'packages/@ImgJSCourse/file-input/src/**/*.js',
        'packages/@ImgJSCourse/form/src/**/*.js',
        'packages/@ImgJSCourse/golden-retriever/src/**/*.js',
        'packages/@ImgJSCourse/google-drive/src/**/*.js',
        'packages/@ImgJSCourse/image-editor/src/**/*.js',
        'packages/@ImgJSCourse/informer/src/**/*.js',
        'packages/@ImgJSCourse/instagram/src/**/*.js',
        'packages/@ImgJSCourse/locales/src/**/*.js',
        'packages/@ImgJSCourse/locales/template.js',
        'packages/@ImgJSCourse/onedrive/src/**/*.js',
        'packages/@ImgJSCourse/progress-bar/src/**/*.js',
        'packages/@ImgJSCourse/provider-views/src/**/*.js',
        'packages/@ImgJSCourse/react/src/**/*.js',
        'packages/@ImgJSCourse/redux-dev-tools/src/**/*.js',
        'packages/@ImgJSCourse/remote-sources/src/**/*.js',
        'packages/@ImgJSCourse/screen-capture/src/**/*.js',
        'packages/@ImgJSCourse/status-bar/src/**/*.js',
        'packages/@ImgJSCourse/store-default/src/**/*.js',
        'packages/@ImgJSCourse/store-redux/src/**/*.js',
        'packages/@ImgJSCourse/svelte/rollup.config.js',
        'packages/@ImgJSCourse/svelte/src/**/*.js',
        'packages/@ImgJSCourse/thumbnail-generator/src/**/*.js',
        'packages/@ImgJSCourse/transloadit/src/**/*.js',
        'packages/@ImgJSCourse/tus/src/**/*.js',
        'packages/@ImgJSCourse/unsplash/src/**/*.js',
        'packages/@ImgJSCourse/url/src/**/*.js',
        'packages/@ImgJSCourse/utils/src/**/*.js',
        'packages/@ImgJSCourse/vue/src/**/*.js',
        'packages/@ImgJSCourse/webcam/src/**/*.js',
        'packages/@ImgJSCourse/xhr-upload/src/**/*.js',
        'packages/@ImgJSCourse/zoom/src/**/*.js',
      ],
      parser: 'espree',
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: false,
        },
      },
      rules: {
        'import/named': 'off', // Disabled because that rule tries and fails to parse JSX dependencies.
        'import/no-named-as-default': 'off', // Disabled because that rule tries and fails to parse JSX dependencies.
        'import/no-named-as-default-member': 'off', // Disabled because that rule tries and fails to parse JSX dependencies.
        'no-restricted-globals': [
          'error',
          {
            name: '__filename',
            message: 'Use import.meta.url instead',
          },
          {
            name: '__dirname',
            message: 'Not available in ESM',
          },
          {
            name: 'exports',
            message: 'Not available in ESM',
          },
          {
            name: 'module',
            message: 'Not available in ESM',
          },
          {
            name: 'require',
            message: 'Use import instead',
          },
        ],
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
    {
      files: ['packages/ImgJSCourse/*.mjs'],
      rules: {
        'import/first': 'off',
        'import/newline-after-import': 'off',
        'import/no-extraneous-dependencies': ['error', {
          devDependencies: true,
        }],
      },
    },
    {
      files: [
        'packages/@ImgJSCourse/*/types/*.d.ts',
      ],
      rules : {
        'import/no-unresolved': 'off',
        'max-classes-per-file': 'off',
        'no-use-before-define': 'off',
      },
    },
    {
      files: [
        'packages/@ImgJSCourse/dashboard/src/components/**/*.jsx',
      ],
      rules: {
        'react/destructuring-assignment': 'off',
      },
    },
    {
      files: [
        // Those need looser rules, and cannot be made part of the stricter rules above.
        // TODO: update those to more modern code when switch to ESM is complete
        'examples/react-native-expo/*.js',
        'examples/svelte-example/**/*.js',
        'examples/vue/**/*.js',
        'examples/vue3/**/*.js',
      ],
      rules: {
        'no-unused-vars': [
          'error',
          {
            'varsIgnorePattern': 'React',
          },
        ],
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['./packages/@ImgJSCourse/companion/**/*.js'],
      rules: {
        'no-underscore-dangle': 'off',
      },
    },
    {
      files: [
        '*.test.js',
        'test/endtoend/*.js',
        'bin/**.js',
      ],
      rules: {
        'compat/compat': ['off'],
      },
    },
    {
      files: [
        'bin/**.js',
        'bin/**.mjs',
        'examples/**/*.cjs',
        'examples/**/*.js',
        'packages/@ImgJSCourse/companion/test/**/*.js',
        'test/**/*.js',
        'test/**/*.ts',
        '*.test.js',
        '*.test.ts',
        '*.test-d.ts',
        '*.test-d.tsx',
        'postcss.config.js',
        '.eslintrc.js',
        'private/**/*.js',
        'private/**/*.mjs',
      ],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': ['error', {
          devDependencies: true,
        }],
      },
    },

    {
      files: [
        'packages/@ImgJSCourse/locales/src/*.js',
        'packages/@ImgJSCourse/locales/template.js',
      ],
      rules: {
        camelcase: ['off'],
        'quote-props': ['error', 'as-needed', { 'numbers': true }],
      },
    },

    {
      files: ['test/endtoend/*/*.mjs', 'test/endtoend/*/*.ts'],
      rules: {
        // we mostly import @ImgJSCourse stuff in these files.
        'import/no-extraneous-dependencies': ['off'],
      },
    },
    {
      files: ['test/endtoend/*/*.js'],
      env: {
        mocha: true,
      },
    },

    {
      files: ['packages/@ImgJSCourse/react/src/**/*.js'],
      rules: {
        'import/no-extraneous-dependencies': ['error', {
          peerDependencies: true,
        }],
      },
    },

    {
      files: ['**/*.md', '*.md'],
      processor: 'markdown/markdown',
    },
    {
      files: ['**/*.md/*.js', '**/*.md/*.javascript'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'react/destructuring-assignment': 'off',
        'no-restricted-globals': [
          'error',
          {
            name: '__filename',
            message: 'Use import.meta.url instead',
          },
          {
            name: '__dirname',
            message: 'Not available in ESM',
          },
          {
            name: 'exports',
            message: 'Not available in ESM',
          },
          {
            name: 'module',
            message: 'Not available in ESM',
          },
          {
            name: 'require',
            message: 'Use import instead',
          },
        ],
      },
    },
    {
      files: ['**/*.ts', '**/*.md/*.ts', '**/*.md/*.typescript'],
      excludedFiles: ['examples/angular-example/**/*.ts', 'packages/@ImgJSCourse/angular/**/*.ts'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
          },
        },
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        'import/prefer-default-export': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-extra-semi': 'off',
        '@typescript-eslint/no-namespace': 'off',
      },
    },
    {
      files: ['packages/@ImgJSCourse/*/src/**/*.ts', 'packages/@ImgJSCourse/*/src/**/*.tsx'],
      excludedFiles: ['packages/@ImgJSCourse/**/*.test.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
      },
    },
    {
      files: ['**/*.md/*.*'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
        'no-console': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['**/react/*.md/*.js', '**/react.md/*.js', '**/react-*.md/*.js', '**/react/**/*.test-d.tsx'],
      settings: {
        react: { pragma: 'React' },
      },
    },
    {
      files: ['**/react/**/*.test-d.tsx'],
      rules: {
        'import/extensions': 'off',
        'import/no-useless-path-segments': 'off',
        'no-alert': 'off',
        'no-inner-declarations': 'off',
        'no-lone-blocks': 'off',
        'no-unused-expressions': 'off',
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['e2e/**/*.ts'],
      extends: ['plugin:cypress/recommended'],
    },
    {
      files: ['e2e/**/*.ts', 'e2e/**/*.js', 'e2e/**/*.jsx', 'e2e/**/*.mjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'no-console': 'off',
        'no-only-tests/no-only-tests': 'error',
        'no-unused-expressions': 'off',
      },
    },
  ],
}
