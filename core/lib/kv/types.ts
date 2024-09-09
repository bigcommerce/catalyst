export type SetCommandOptions = Record<string, unknown>;

export interface KvAdapter {
  mget<Data>(...keys: string[]): Promise<Array<Data | null>>;
  set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data | null>;
}
