import { AuthKey } from '@/providers/keys';
import { configureAuth } from 'centaurea-ui-shared';

export function provideAuth(app, { apiUrl }) {
  const manager = configureAuth(apiUrl);
  app.provide(AuthKey, manager);
  return manager;
}
