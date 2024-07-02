#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import esbuild from 'esbuild';
import babel from 'esbuild-plugin-babel';

const ROOT = new URL('../', import.meta.url);
const PACKROOT = new URL('./packages/', ROOT);

async function buildBundle(srcFile, bundleFile1, optts = {}) {
  const { minify = true, standalone = '', plugins, target, format } = optts;
  await esbuild.build({
    bundle: true,
    sourcemap: true,
    entryPoints: [srcFile],
    outfile: bundleFile1,
    platform: 'browser',
    minify,
    keepNames: true,
    plugins,
    target,
    format,
  });


  const buildType = minify ? 'Minified' : '';
  console.log(chalk.green(`Built ${buildType} Bundle [${standalone}]:`), chalk.magenta(bundleFile1));
}

async function buildAllBundles() {
  await fs.mkdir(new URL('./ImgJSCourse/dist', PACKROOT), { recursive: true });
  await fs.mkdir(new URL('./@ImgJSCourse/locales/dist', PACKROOT), { recursive: true });

  const bundleTasks = [
    buildBundle(
      './packages/ImgJSCourse/index.mjs',
      './packages/ImgJSCourse/dist/ImgJSCourse.min.mjs',
      { standalone: 'ImgJSCourse (ESM)', format: 'esm' },
    ),
    buildBundle(
      './packages/ImgJSCourse/bundle-legacy.mjs',
      './packages/ImgJSCourse/dist/ImgJSCourse.legacy.min.js',
      {
        standalone: 'ImgJSCourse (with polyfills)',
        target: 'es5',
        plugins: [babel({ /* babel config */ })],
      },
    ),
    buildBundle(
      './packages/ImgJSCourse/bundle.mjs',
      './packages/ImgJSCourse/dist/ImgJSCourse.min.js',
      { standalone: 'ImgJSCourse', format: 'iife' },
    ),
  ];

  const localesModules = await fs.opendir(new URL('./@ImgJSCourse/locales/src/', PACKROOT));
  for await (const dirent of localesModules) {
    if (dirent.isDirectory() || !dirent.name.endsWith('.js')) continue;
    const localeName = path.basename(dirent.name, '.js');
    bundleTasks.push(
      buildBundle(
        `./packages/@ImgJSCourse/locales/src/${localeName}.js`,
        `./packages/@ImgJSCourse/locales/dist/${localeName}.min.js`,
      ),
    );
  }

  
  await Promise.all(bundleTasks);
}

buildAllBundles().catch((err) => {
  process.exit(1);
});
