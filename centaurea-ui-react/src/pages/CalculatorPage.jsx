import { BinaryOperations, formatDate, isValidRegexp, OperationNames, OperationSymbols, OperationType, RegexpOperation, UnaryOperations } from 'centaurea-ui-shared';
import { useEffect, useState } from 'react';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Card from '../components/Card';
import Form from '../components/Form';
import FormGroup from '../components/FormGroup';
import FormInput from '../components/FormInput';
import FormLabel from '../components/FormLabel';
import FormSelect from '../components/FormSelect';
import Section from '../components/Section';
import SectionHeader from '../components/SectionHeader';
import StatusMessage from '../components/StatusMessage';
import { useApi } from '../providers';

function CardContentResult({ expression, result, computedTime }) {
  return (
    <>
      <h3 className="card--result__title">Result</h3>
      <div className="card--result__expression">{expression}</div>
      <div className="card--result__value">{result}</div>
      {computedTime && <div className="card--result__meta">Computed at: {computedTime}</div>}
    </>
  );
}

function CalculatorPage() {
  const { calculate: { mutate, isPending, error, data } } = useApi();
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);
  const [regexpUsage, setRegexpUsage] = useState(null);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [localError, setLocalError] = useState(null);

  const isUnaryOp = UnaryOperations.includes(operation);
  const isRegexpOp = operation === RegexpOperation;

  useEffect(() => {
    if (data) {
      if (data.regexpUsage) {
        setRegexpUsage(data.regexpUsage);
        if (data.regexpUsage.remaining === 1) {
          setShowWarningToast(true);
          setTimeout(() => setShowWarningToast(false), 5000);
        }
      }
    }
  }, [data]);

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

        if (!isValidRegexp(pattern)) {
          throw new Error('Invalid regex pattern');
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

  const computedTimeText = data?.result ? (formatDate(data?.result?.computedTime) || null) : null;
  const displayError = error?.message || localError;
  const result = data?.result;
  const hasAsyncState = isPending || !!displayError || !!result;

  return (
    <Section>
      <SectionHeader title="Calculator" />
      <Form onSubmit={handleCalculate}>
        <FormGroup>
          <FormLabel>Operation</FormLabel>
          <FormSelect
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
          </FormSelect>
        </FormGroup>

        {isRegexpOp ? (
          <>
            <FormGroup>
              <FormLabel>Pattern (Regular Expression)</FormLabel>
              <FormInput
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g., \d+)"
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Text to Search</FormLabel>
              <FormInput
                as="textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to search"
                rows={4}
                required
              />
            </FormGroup>
          </>
        ) : (
          <>
            <FormGroup>
              <FormLabel>First Operand</FormLabel>
              <FormInput
                type="number"
                step="any"
                value={firstOperand}
                onChange={(e) => setFirstOperand(e.target.value)}
                placeholder="Enter first number"
                required
              />
            </FormGroup>

            {!isUnaryOp && (
              <FormGroup>
                <FormLabel>Second Operand</FormLabel>
                <FormInput
                  type="number"
                  step="any"
                  value={secondOperand}
                  onChange={(e) => setSecondOperand(e.target.value)}
                  placeholder="Enter second number"
                  required
                />
              </FormGroup>
            )}
          </>
        )}

        <Button type="submit" disabled={isPending}>
          Calculate
        </Button>
      </Form>

      {showWarningToast && (
        <StatusMessage variant="warning" className="u-margin-top-md">
          ⚠️ Warning: You have 1 Regexp calculation remaining today!
        </StatusMessage>
      )}

      {regexpUsage && (
        <StatusMessage variant="info" className="u-margin-top-md">
          {/* @ts-ignore — regexpUsage shape comes from API response */}
          Regexp Usage Today: {regexpUsage.used} / {regexpUsage.total} ({regexpUsage.remaining} remaining)
        </StatusMessage>
      )}

      {hasAsyncState && (
        <AsyncContent
          isLoading={isPending}
          isError={!!displayError}
          error={{ message: displayError }}
          loadingMessage="Calculating..."
        >
          {/* @ts-ignore — result shape comes from API response */}
          <Card variant="result">
            <CardContentResult
              expression={result?.expressionText}
              result={result?.result}
              computedTime={computedTimeText}
            />
          </Card>
        </AsyncContent>
      )}
    </Section>
  );
}

export default CalculatorPage;