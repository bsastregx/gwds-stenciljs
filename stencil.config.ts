import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  buildEs5: true,
  extras: {
    cssVarsShim: true,
    dynamicImportShim: true,
    shadowDomShim: true,
    safari10: true,
    scriptDataOpts: true,
    appendChildSlotFix: true,
    cloneNodeFix: true,
    slotChildNodesFix: true,
  },
  namespace: 'gwds',
  globalStyle: 'src/globals/styles.scss',
  invisiblePrehydration: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      copy: [
        {
          src: 'assets',
          dest: 'dist/assets',
          warn: true,
        },
      ],
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
  plugins: [sass({})],
};
