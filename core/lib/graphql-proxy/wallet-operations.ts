import { type TadaDocumentNode } from 'gql.tada';
import {
  type DocumentNode,
  GraphQLError,
  Kind,
  type OperationDefinitionNode,
  OperationTypeNode,
  parse,
  type SelectionSetNode,
} from 'graphql';

interface AllowedOperation {
  name: string;
  type: OperationTypeNode;
  // Root field path the operation must select.
  path: string[];
}

// Operations sent by checkout-sdk-js wallet buttons.
const ALLOWED_WALLET_OPERATIONS: AllowedOperation[] = [
  {
    name: 'CreatePaymentWalletIntentMutation',
    type: OperationTypeNode.MUTATION,
    path: ['payment', 'paymentWallet', 'createPaymentWalletIntent'],
  },
  {
    name: 'UpdateCheckoutBillingAddressMutation',
    type: OperationTypeNode.MUTATION,
    path: ['checkout', 'updateCheckoutBillingAddress'],
  },
  {
    name: 'AddCheckoutBillingAddressMutation',
    type: OperationTypeNode.MUTATION,
    path: ['checkout', 'addCheckoutBillingAddress'],
  },
  {
    name: 'CheckoutRedirectMutation',
    type: OperationTypeNode.MUTATION,
    path: ['cart', 'createCartRedirectUrls'],
  },
];

// One field per level, so nothing else can ride along with an allowed operation.
function selectsOnlyPath(selectionSet: SelectionSetNode, path: string[]): boolean {
  const [fieldName, ...rest] = path;

  if (fieldName === undefined) {
    return true;
  }

  if (selectionSet.selections.length !== 1) {
    return false;
  }

  const [selection] = selectionSet.selections;

  if (selection?.kind !== Kind.FIELD || selection.name.value !== fieldName) {
    return false;
  }

  if (rest.length === 0) {
    return true;
  }

  return selection.selectionSet ? selectsOnlyPath(selection.selectionSet, rest) : false;
}

function isAllowedOperation(operation: OperationDefinitionNode): boolean {
  return ALLOWED_WALLET_OPERATIONS.some(
    ({ name, type, path }) =>
      operation.operation === type &&
      operation.name?.value === name &&
      selectsOnlyPath(operation.selectionSet, path),
  );
}

// Returns the parsed document if it's an allowed wallet operation, otherwise `null`.
export function parseAllowedWalletOperation(
  query: string,
): TadaDocumentNode<unknown, Record<string, unknown>> | null {
  let document: DocumentNode;

  try {
    document = parse(query);
  } catch (error) {
    if (error instanceof GraphQLError) {
      return null;
    }

    throw error;
  }

  if (document.definitions.length !== 1) {
    return null;
  }

  const [definition] = document.definitions;

  if (definition?.kind !== Kind.OPERATION_DEFINITION || !isAllowedOperation(definition)) {
    return null;
  }

  return document;
}
