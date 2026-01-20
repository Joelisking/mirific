const config = {
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

module.exports = config;
