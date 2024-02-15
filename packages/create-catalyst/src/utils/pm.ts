/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2024 Vercel, Inc.
 *
 * Sourced and modified from:
 * https://github.com/vercel/next.js/blob/771e29cb719b382e92d89cac11fbfcb818f5f628/packages/create-next-app/helpers/get-pkg-manager.ts
 *
 * License:
 * https://github.com/vercel/next.js/blob/771e29cb719b382e92d89cac11fbfcb818f5f628/license.md
 */

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export const packageManagerChoices: PackageManager[] = ['npm', 'pnpm', 'yarn'];

export function getPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('yarn')) {
    return 'yarn';
  }

  if (userAgent.startsWith('pnpm')) {
    return 'pnpm';
  }

  return 'npm';
}
