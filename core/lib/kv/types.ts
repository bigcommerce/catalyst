import { NextRequest } from 'next/server';

export type SetCommandOptions = Record<string, unknown>;

export interface KvAdapter {
  setRequest?: (request: NextRequest) => void;
  mget<Data>(...keys: string[]): Promise<Array<Data | null>>;
  set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data | null>;
}
