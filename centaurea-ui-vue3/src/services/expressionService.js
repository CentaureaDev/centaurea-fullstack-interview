import { createExpressionService, OperationNames, OperationSymbols, OperationType } from 'centaurea-ui-shared';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5034/api';

export const expressionService = createExpressionService(API_URL, () => authService.getToken());

export { OperationNames, OperationSymbols, OperationType };
