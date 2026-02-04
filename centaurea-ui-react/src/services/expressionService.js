import { createExpressionService, OperationNames, OperationSymbols, OperationType, UnaryOperations, BinaryOperations } from 'centaurea-ui-shared';
import { authService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

export const expressionService = createExpressionService(API_URL, () => authService.getToken());

export { OperationNames, OperationSymbols, OperationType, UnaryOperations, BinaryOperations };
