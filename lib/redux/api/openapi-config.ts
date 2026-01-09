import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'http://localhost:3001/api-docs.json',
  apiFile: './index.ts',
  apiImport: 'api',
  outputFile: 'generated.ts',
  exportName: 'api',
  hooks: {
    queries: true,
    lazyQueries: true,
    mutations: true,
  },
  tag: true,
};

export default config;
