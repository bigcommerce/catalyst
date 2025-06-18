export interface SetCommandOptions {
  /** Additional adapter-specific options */
  [key: string]: unknown;
  /** Time to live in seconds - only supported by some adapters */
  ttl?: number;
  /** Cache tags for invalidation - only supported by some adapters */
  tags?: string[];
}

export interface KvAdapter {
  mget<Data>(...keys: string[]): Promise<Array<Data | null>>;
  set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data | null>;
}
