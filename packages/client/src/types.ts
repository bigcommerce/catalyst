// Taken from gql.tada repo
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DocumentDecoration<Result = Record<string, any>, Variables = Record<string, any>> {
  /** Type to support `@graphql-typed-document-node/core`
   * @internal
   */
  __apiType?: (variables: Variables) => Result;
  /** Type to support `TypedQueryDocumentNode` from `graphql`
   * @internal
   */
  __ensureTypesOfVariablesAndResultMatching?: (variables: Variables) => Result;
}
