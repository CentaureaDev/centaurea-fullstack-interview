import { ApiKey } from '@/providers/keys';
import { createApiStack } from 'centaurea-ui-shared';

export function provideApi(app, config) {
  const stack = createApiStack(config);
  app.provide(ApiKey, stack);
  return stack;
}
