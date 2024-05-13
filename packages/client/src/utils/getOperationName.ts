import { DefinitionNode, Kind, OperationDefinitionNode, parse } from 'graphql';

function isOperationDefinitionNode(node: DefinitionNode): node is OperationDefinitionNode {
  return node.kind === Kind.OPERATION_DEFINITION;
}

export const getOperationInfo = (document: string) => {
  const documentNode = parse(document);

  const operationInfo = documentNode.definitions.filter(isOperationDefinitionNode).map((def) => {
    return {
      name: def.name?.value,
      type: def.operation,
    };
  })[0];

  return operationInfo;
};
