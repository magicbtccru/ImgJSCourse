const babel = require('@babel/core');
const path = require('node:path');
const t = require('@babel/types');
const { promisify } = require('node:util');
const fs = require('node:fs');
const glob = promisify(require('glob'));

const { mkdir, stat, writeFile } = fs.promises;


const PACKAGE_JSON_IMPORT = /^\..*\/package.json$/;
const SOURCE_PATTERN = 'packages/{*,@ImgJSCourse/*}/src/**/*.{js,ts}?(x)';
const IGNORE_PATTERN = /\.test\.[jt]s$|__mocks__|svelte|angular|companion\//;
const META_FILES = [
  'babel.config.js',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'bin/build-lib.js',
];

const versionCache = new Map();

async function getFileLastModifiedTime(filePath, createParentDir = false) {
  try {
    const stats = await stat(filePath);
    return stats.mtime;
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (createParentDir) {
        await mkdir(path.dirname(filePath), { recursive: true });
      }
      return 0;
    }
    throw err;
  }
}

async function cachePackageVersion(packagePath) {
  if (versionCache.has(packagePath)) return;

  const packageJsonPath = path.join(__dirname, '..', packagePath, 'package.json');
  const { version } = require(packageJsonPath);
  if (process.env.FRESH) {
    await mkdir(path.join(packagePath, 'lib'), { recursive: true });
  }
  versionCache.set(packagePath, version);
}

function rewriteImports(path) {
  const nonJSImport = /^\.\.?\/.+\.([jt]sx|ts)$/;
  const match = nonJSImport.exec(path.node.source.value);
  if (match) {
    path.node.source.value = `${match[0].slice(0, -match[1].length)}js`;
  }
}

async function buildLibrary() {
  console.log('Using Babel version:', require('@babel/core/package.json').version);

  const metaModifiedTimes = await Promise.all(META_FILES.map(filename =>
    getFileLastModifiedTime(path.join(__dirname, '..', filename))
  ));
  const latestMetaModifiedTime = Math.max(...metaModifiedTimes);

  const sourceFiles = await glob(SOURCE_PATTERN);

  for (const file of sourceFiles) {
    if (IGNORE_PATTERN.test(file)) continue;

    await cachePackageVersion(file.slice(0, file.indexOf('/src/')));
    const libFilePath = file.replace('/src/', '/lib/').replace(/\.[jt]sx?$/, '.js');

    if (!process.env.FRESH) {
      const [sourceModifiedTime, libModifiedTime] = await Promise.all([
        getFileLastModifiedTime(file),
        getFileLastModifiedTime(libFilePath, true),
      ]);
      if (sourceModifiedTime < libModifiedTime && latestMetaModifiedTime < libModifiedTime) {
        continue;
      }
    }

    await compileFile(file, libFilePath);
  }
}

async function compileFile(sourceFile, outputFile) {
  const babelPlugins = createBabelPlugins(sourceFile);
  const { code, map } = await babel.transformFileAsync(sourceFile, { sourceMaps: true, plugins: babelPlugins });
  const [{ default: chalk }] = await Promise.all([
    import('chalk'),
    writeFile(outputFile, code),
    writeFile(`${outputFile}.map`, JSON.stringify(map)),
  ]);

  console.log(chalk.green('Compiled lib:'), chalk.magenta(outputFile));
}

function createBabelPlugins(file) {
  const plugins = [{
    visitor: {
      ImportDeclaration(path) {
        rewriteImports(path);
        handlePackageJsonImport(path, file);
      },
      ExportAllDeclaration: rewriteImports,
    },
  }];

  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    plugins.push(['@babel/plugin-transform-typescript', {
      disallowAmbiguousJSXLike: true,
      isTSX: file.endsWith('.tsx'),
      jsxPragma: 'h'
    }]);
  }

  return plugins;
}

function handlePackageJsonImport(path, file) {
  if (PACKAGE_JSON_IMPORT.test(path.node.source.value) &&
    path.node.specifiers.length === 1 &&
    path.node.specifiers[0].type === 'ImportDefaultSpecifier') {
    const packageVersion = versionCache.get(file.slice(0, file.indexOf('/src/')));
    if (packageVersion != null) {
      const [{ local }] = path.node.specifiers;
      path.replaceWith(
        t.variableDeclaration('const', [
          t.variableDeclarator(local, t.objectExpression([
            t.objectProperty(t.stringLiteral('version'), t.stringLiteral(packageVersion)),
          ]))
        ]),
      );
    }
  }
}

buildLibrary().catch(err => {
  console.error(err);
  process.exit(1);
});
