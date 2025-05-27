/**
 * Converts type T to a new type where all properties are optional except for the ones specified in K.
 */
type PartialRequired<T, K extends keyof T> = {
  [P in K]: T[P];
} & {
  [P in Exclude<keyof T, K>]?: T[P];
};
