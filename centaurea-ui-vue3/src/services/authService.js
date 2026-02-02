import { createAuthService } from 'centaurea-ui-shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5034/api';

export const authService = createAuthService(API_URL);
