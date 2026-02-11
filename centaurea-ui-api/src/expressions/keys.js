/**
 * Expression Query Keys
 * 
 * TanStack Query keys for expression cache management
 */

export const expressionKeys = {
  all: ['expressions'],
  samples: () => ['expressions', 'samples'],
  history: (limit) => ['expressions', 'history', { limit }],
};
