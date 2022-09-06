import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'gwds',
  globalStyle: 'src/globals/tokens.scss',
  invisiblePrehydration: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{ src: 'assets' }],
    },
    {
      type: 'dist-hydrate-script',
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ['src/globals/global.scss'],
    }),
  ],
};
