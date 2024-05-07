export type SetCommandOptions = Record<string, unknown>;

export interface KvAdapter {
  get<Data>(key: string): Promise<Data | null>;
  mget<Data>(...keys: string[]): Promise<Array<Data | null>>;
  set<Data, Options extends SetCommandOptions = SetCommandOptions>(
    key: string,
    value: Data,
    opts?: Options,
  ): Promise<Data | null>;
}
