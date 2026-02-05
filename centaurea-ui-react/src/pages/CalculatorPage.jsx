import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';
import { expressionService, OperationType, OperationSymbols, OperationNames, UnaryOperations, BinaryOperations, RegexpOperation } from '../services/expressionService';

function CalculatorPage() {
  const navigate = useNavigate();
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regexpUsage, setRegexpUsage] = useState(null);
  const [showWarningToast, setShowWarningToast] = useState(false);

  const isUnaryOp = UnaryOperations.includes(operation);
  const isRegexpOp = operation === RegexpOperation;

  useEffect(() => {
    const handleStateChange = (state) => {
      setResult(state.calculationResult);
      setLoading(state.loading);
      setError(state.error);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    return unsubscribe;
  }, []);

  const handleSignOutAndRedirect = () => {
    authService.signOut();
    appStore.setUser(null);
    appStore.setRedirectMessage('Your session has expired. Please sign in again.');
    navigate('/auth');
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    appStore.setError(null);
    appStore.setLoading(true);
    setRegexpUsage(null);
    setShowWarningToast(false);

    try {
      let responseData;
      
      if (isRegexpOp) {
        if (!pattern.trim() || !text.trim()) {
          throw new Error('Pattern and text are required for Regexp operation');
        }
        
        // Validate regex pattern syntax
        try {
          new RegExp(pattern);
        } catch (regexError) {
          throw new Error(`Invalid regex pattern: ${regexError.message}`);
        }
        
        responseData = await expressionService.calculate(operation, 0, 0, pattern, text);
      } else {
        const first = parseFloat(firstOperand);
        const second = isUnaryOp ? 0 : parseFloat(secondOperand);

        if (isNaN(first) || (!isUnaryOp && isNaN(second))) {
          throw new Error('Please enter valid numbers');
        }
        responseData = await expressionService.calculate(operation, first, second);
      }

      // Handle response - it may be wrapped in a response object
      const resultData = responseData.result || responseData;
      appStore.setCalculationResult(resultData);
      
      // Handle regexp usage info
      if (responseData.regexpUsage) {
        setRegexpUsage(responseData.regexpUsage);
        // Show warning toast if user has 1 calculation remaining
        if (responseData.regexpUsage.remaining === 1) {
          setShowWarningToast(true);
          setTimeout(() => setShowWarningToast(false), 5000);
        }
      }
    } catch (err) {
      if (err.status === 401) {
        handleSignOutAndRedirect();
      } else {
        appStore.setError(err.message || 'Calculation failed');
      }
    } finally {
      appStore.setLoading(false);
    }
  };

  const formatComputedTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  };

  const computedTimeText = formatComputedTime(result?.computedTime);

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Calculator</h2>
      </div>
      <form onSubmit={handleCalculate} className="form">
        <div className="form__group">
          <label className="form__label">Operation</label>
          <select
            className="form__select"
            value={operation}
            onChange={(e) => {
              setOperation(Number(e.target.value));
              setResult(null);
              setRegexpUsage(null);
              setShowWarningToast(false);
            }}
          >
            <optgroup label="Binary Operations">
              {BinaryOperations.map((op) => (
                <option key={op} value={op}>
                  {OperationSymbols[op]} {OperationNames[op]}
                </option>
              ))}
            </optgroup>
            <optgroup label="String Operations">
              <option value={RegexpOperation}>
                {OperationSymbols[RegexpOperation]} {OperationNames[RegexpOperation]}
              </option>
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

        {isRegexpOp ? (
          <>
            <div className="form__group">
              <label className="form__label">Pattern (Regular Expression)</label>
              <input
                className="form__input"
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g., \d+)"
                required
              />
            </div>
            <div className="form__group">
              <label className="form__label">Text to Search</label>
              <textarea
                className="form__input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to search"
                rows="4"
                required
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="form__group">
              <label className="form__label">First Operand</label>
              <input
                className="form__input"
                type="number"
                step="any"
                value={firstOperand}
                onChange={(e) => setFirstOperand(e.target.value)}
                placeholder="Enter first number"
                required
              />
            </div>

            {!isUnaryOp && (
              <div className="form__group">
                <label className="form__label">Second Operand</label>
                <input
                  className="form__input"
                  type="number"
                  step="any"
                  value={secondOperand}
                  onChange={(e) => setSecondOperand(e.target.value)}
                  placeholder="Enter second number"
                  required
                />
              </div>
            )}
          </>
        )}

        <button type="submit" className="button button--primary" disabled={loading}>
          Calculate
        </button>
      </form>

      {showWarningToast && (
        <div className="message message--warning" style={{ marginTop: '1rem' }}>
          ⚠️ Warning: You have 1 Regexp calculation remaining today!
        </div>
      )}

      {regexpUsage && (
        <div className="message message--info" style={{ marginTop: '1rem' }}>
          Regexp Usage Today: {regexpUsage.used} / {regexpUsage.total} ({regexpUsage.remaining} remaining)
        </div>
      )}

      {error && <div className="message message--error">{error}</div>}
      {loading && <div className="message message--loading">Calculating...</div>}

      {result && (
        <div className="card card--result">
          <h3 className="card--result__title">Result</h3>
          <div className="card--result__expression">{result.expressionText}</div>
          <div className="card--result__value">{result.result}</div>
          {computedTimeText && (
            <div className="card--result__meta">Computed at: {computedTimeText}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalculatorPage;
