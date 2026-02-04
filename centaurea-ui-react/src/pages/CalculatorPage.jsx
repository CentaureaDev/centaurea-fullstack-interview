import React, { useState, useEffect } from 'react';
import { appStore } from '../store/appStore';
import { expressionService, OperationType, OperationSymbols, OperationNames, UnaryOperations, BinaryOperations } from '../services/expressionService';

function CalculatorPage() {
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isUnaryOp = UnaryOperations.includes(operation);

  useEffect(() => {
    const handleStateChange = (state) => {
      setResult(state.calculationResult);
      setLoading(state.loading);
      setError(state.error);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    return unsubscribe;
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    appStore.setError(null);
    appStore.setLoading(true);

    try {
      const first = parseFloat(firstOperand);
      const second = isUnaryOp ? 0 : parseFloat(secondOperand);

      if (isNaN(first) || (!isUnaryOp && isNaN(second))) {
        throw new Error('Please enter valid numbers');
      }

      const result = await expressionService.calculate(operation, first, second);
      appStore.setCalculationResult(result);
    } catch (err) {
      appStore.setError(err.message || 'Calculation failed');
    } finally {
      appStore.setLoading(false);
    }
  };

  return (
    <div className="calculator-section">
      <form onSubmit={handleCalculate} className="calculator-form">
        <div className="form-group">
          <label>Operation</label>
          <select
            value={operation}
            onChange={(e) => {
              setOperation(Number(e.target.value));
              setResult(null);
            }}
          >
            <optgroup label="Binary Operations">
              {BinaryOperations.map((op) => (
                <option key={op} value={op}>
                  {OperationSymbols[op]} {OperationNames[op]}
                </option>
              ))}
            </optgroup>
            <optgroup label="Unary Operations">
              {UnaryOperations.map((op) => (
                <option key={op} value={op}>
                  {OperationSymbols[op]} {OperationNames[op]}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="form-group">
          <label>First Operand</label>
          <input
            type="number"
            step="any"
            value={firstOperand}
            onChange={(e) => setFirstOperand(e.target.value)}
            placeholder="Enter first number"
            required
          />
        </div>

        {!isUnaryOp && (
          <div className="form-group">
            <label>Second Operand</label>
            <input
              type="number"
              step="any"
              value={secondOperand}
              onChange={(e) => setSecondOperand(e.target.value)}
              placeholder="Enter second number"
              required
            />
          </div>
        )}

        <button type="submit" className="calculate-btn" disabled={loading}>
          Calculate
        </button>
      </form>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Calculating...</div>}

      {result && (
        <div className="result">
          <h3>Result</h3>
          <div className="result-expression">{result.expressionText}</div>
          <div className="result-value">{result.result}</div>
          <div className="result-meta">
            Computed at: {new Date(result.computedTime).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculatorPage;
