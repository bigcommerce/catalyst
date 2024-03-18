import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['client/queries/**/*.ts', 'client/mutations/**/*.ts', 'client/fragments/**/*.ts'],
  generates: {
    './client/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: 'string',
        avoidOptionals: {
          field: true,
        },
        scalars: {
          DateTime: 'string',
          Long: 'number',
          BigDecimal: 'number',
        },
      },
    },
  },
};

export default config;
