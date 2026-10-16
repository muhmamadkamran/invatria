import type { FullConfig } from '@playwright/test';
import setup from './server-setup';

export default function productionSetup(config: FullConfig) {
  return setup(config, 'production');
}
