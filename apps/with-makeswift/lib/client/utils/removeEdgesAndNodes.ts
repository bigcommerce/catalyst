export type Maybe<T> = T | null;

export interface Connection<T> {
  edges?: Maybe<Array<Maybe<Edge<T>>>> | undefined;
}

export interface Edge<T> {
  node: T;
}

export const removeEdgesAndNodes = <T>(array: Connection<T>) => {
  if (!array.edges) {
    return [];
  }

  return array.edges.filter((edge): edge is Edge<T> => edge !== null).map((edge) => edge.node);
};
