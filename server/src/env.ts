import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnv(): string | null {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
    resolve(import.meta.dirname ?? '.', '../.env'),
    resolve(import.meta.dirname ?? '.', '../../.env'),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      process.loadEnvFile(path);
      return path;
    } catch {
      // try next
    }
  }
  return null;
}
