export interface KvAdapter {
  get<Data>(key: string): Promise<Data | null>;
  mget<Data>(...keys: string[]): Promise<Array<Data | null>>;
  set<Data>(key: string, value: Data): Promise<Data | null>;
}
