/**
 * Operation Type Enumeration
 */
export const OperationType = {
  Addition: 0,
  Subtraction: 1,
  Multiplication: 2,
  Division: 3,
  Regexp: 4,
  Factorial: 5,
  Square: 6,
  SquareRoot: 7,
  Negate: 8,
};

/**
 * Operation Symbols
 */
export const OperationSymbols = {
  [OperationType.Addition]: '+',
  [OperationType.Subtraction]: '-',
  [OperationType.Multiplication]: '*',
  [OperationType.Division]: '/',
  [OperationType.Regexp]: '~',
  [OperationType.Factorial]: '!',
  [OperationType.Square]: '²',
  [OperationType.SquareRoot]: '√',
  [OperationType.Negate]: '-',
};

/**
 * Operation Names
 */
export const OperationNames = {
  [OperationType.Addition]: 'Addition',
  [OperationType.Subtraction]: 'Subtraction',
  [OperationType.Multiplication]: 'Multiplication',
  [OperationType.Division]: 'Division',
  [OperationType.Regexp]: 'Regexp',
  [OperationType.Factorial]: 'Factorial',
  [OperationType.Square]: 'Square',
  [OperationType.SquareRoot]: 'Square Root',
  [OperationType.Negate]: 'Negate',
};

/**
 * Unary Operations
 */
export const UnaryOperations = [
  OperationType.Factorial,
  OperationType.Square,
  OperationType.SquareRoot,
  OperationType.Negate,
];

/**
 * Binary Operations
 */
export const BinaryOperations = [
  OperationType.Addition,
  OperationType.Subtraction,
  OperationType.Multiplication,
  OperationType.Division,
];

/**
 * Regexp Operation
 */
export const RegexpOperation = OperationType.Regexp;
