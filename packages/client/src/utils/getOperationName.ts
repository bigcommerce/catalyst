import { DefinitionNode, OperationDefinitionNode, parse } from '@0no-co/graphql.web';

function isOperationDefinitionNode(node: DefinitionNode): node is OperationDefinitionNode {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return node.kind === 'OperationDefinition';
}

interface OperationInfo {
  name?: string;
  type: 'query' | 'mutation' | 'subscription';
}

export const getOperationInfo = (document: string): OperationInfo => {
  const documentNode = parse(document);

  const operationInfo = documentNode.definitions.filter(isOperationDefinitionNode).map((def) => {
    return {
      name: def.name?.value,
      type: def.operation,
    };
  })[0];

  return operationInfo;
};
