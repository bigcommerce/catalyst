import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { DefinitionNode, OperationDefinitionNode, parse } from 'graphql';

function isOperationDefinitionNode(node: DefinitionNode): node is OperationDefinitionNode {
  return node.kind === 'OperationDefinition';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOperationInfo = (document: DocumentTypeDecoration<any, any>) => {
  const documentNode = parse(document.toString());

  const operationInfo = documentNode.definitions.filter(isOperationDefinitionNode).map((def) => {
    return {
      name: def.name?.value,
      type: def.operation,
    };
  })[0];

  return operationInfo;
};
