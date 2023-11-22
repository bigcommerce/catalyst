export type Unpacked<T> = T extends Array<infer U> ? U : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExistingResultType<T extends (...args: any) => any> = NonNullable<
  Awaited<ReturnType<T>>
>;
