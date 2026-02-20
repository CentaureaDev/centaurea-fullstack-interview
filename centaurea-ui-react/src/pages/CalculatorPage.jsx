import React, { useEffect, useState } from 'react';
import { BinaryOperations, OperationNames, OperationSymbols, OperationType, RegexpOperation, UnaryOperations, useCalculate } from '../features/expressions';

function CalculatorPage() {
  /** @type {any} */
  const { mutate, isPending, error, data } = useCalculate();
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);
  /**
   * @type {[{used: number, total: number, remaining: number}|null, Function]}
   */
  const [regexpUsage, setRegexpUsage] = useState(null);
  const [showWarningToast, setShowWarningToast] = useState(false);
  /** @type {[string|null, Function]} */
  const [localError, setLocalError] = useState(null);

  const isUnaryOp = UnaryOperations.includes(operation);
  const isRegexpOp = operation === RegexpOperation;

  /**
   * Handle calculation submission
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {void}
   */
  const handleCalculate = (e) => {
    e.preventDefault();
    setLocalError(null);
    setRegexpUsage(null);
    setShowWarningToast(false);

    try {
      if (isRegexpOp) {
        if (!pattern.trim() || !text.trim()) {
          throw new Error('Pattern and text are required for Regexp operation');
        }
        
        // Validate regex pattern syntax
        try {
          new RegExp(pattern);
        } catch (regexError) {
          const message = regexError instanceof Error ? regexError.message : 'Invalid regex';
          throw new Error(`Invalid regex pattern: ${message}`);
        }
        
        mutate({ operation, pattern, text });
      } else {
        const first = parseFloat(firstOperand);
        const second = isUnaryOp ? 0 : parseFloat(secondOperand);

        if (isNaN(first) || (!isUnaryOp && isNaN(second))) {
          throw new Error('Please enter valid numbers');
        }
        mutate({ operation, firstOperand: first, secondOperand: second });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setLocalError(errorMessage);
    }
  };

  // Handle mutation response
  useEffect(() => {
    if (data) {
      // Handle regexp usage info
      if (data.regexpUsage) {
        setRegexpUsage(data.regexpUsage);
        // Show warning toast if user has 1 calculation remaining
        if (data.regexpUsage.remaining === 1) {
          setShowWarningToast(true);
          setTimeout(() => setShowWarningToast(false), 5000);
        }
      }
    }
  }, [data]);

  /**
   * Format computed time from ISO string to locale string
   * @param {string|null|undefined} value - ISO datetime string
   * @returns {string|null} Formatted datetime or null
   */
  const formatComputedTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  };

  /** @ts-ignore */
  const computedTimeText = data?.result ? formatComputedTime(data?.result?.computedTime) : null;
  const displayError = error?.message || localError;
  const result = data?.result;

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
                className="form__input form__textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to search"
                rows={4}
                required
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

        <button type="submit" className="button button--primary" disabled={isPending}>
          Calculate
        </button>
      </form>

      {showWarningToast && (
        <div className="message message--warning u-margin-top-md">
          ⚠️ Warning: You have 1 Regexp calculation remaining today!
        </div>
      )}

      {regexpUsage && (
        <div className="message message--info u-margin-top-md">
          {/* @ts-ignore */}
          Regexp Usage Today: {regexpUsage.used} / {regexpUsage.total} ({regexpUsage.remaining} remaining)
        </div>
      )}

      {displayError && (
        <div className="message message--error">
          {displayError.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}
      {isPending && <div className="message message--loading">Calculating...</div>}

      {result && (
        <div className="card card--result">
          <h3 className="card--result__title">Result</h3>
          {/* @ts-ignore */}
          <div className="card--result__expression">{result.expressionText}</div>
          {/* @ts-ignore */}
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
