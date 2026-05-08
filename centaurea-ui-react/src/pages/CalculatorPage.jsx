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
import { useApi, useNotification } from '../providers';

function CardContentResult({ expression, result, computedTime }) {
  return (
    <>
      <h3 className="card__title">Result</h3>
      <div className="card__expression">{expression}</div>
      <div className="card__value">{result}</div>
      {computedTime && <div className="card__meta">Computed at: {computedTime}</div>}
    </>
  );
}

function CalculatorPage() {
  const { calculate: { mutate, isPending, data } } = useApi();
  const { notify, notifyError } = useNotification();
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);

  const isUnaryOp = UnaryOperations.includes(operation);
  const isRegexpOp = operation === RegexpOperation;
  const computedTimeText = data?.result ? (formatDate(data?.result?.computedTime) || null) : null;
  const result = data?.result;
  const hasAsyncState = isPending || !!result;

  useEffect(() => {
    if (data?.regexpUsage) {
      const usage = data.regexpUsage;
      notify('info', `Regexp Usage Today: ${usage.used} / ${usage.total} (${usage.remaining} remaining)`);
      if (usage.remaining === 1) {
        notify('warning', 'Warning: You have 1 Regexp calculation remaining today!');
      }
    }
  }, [data, notify]);

  const handleCalculate = (e) => {
    e.preventDefault();

    let validationError = null;

    if (isRegexpOp) {
      if (!pattern.trim() || !text.trim()) {
        validationError = 'Pattern and text are required for Regexp operation';
      } else if (!isValidRegexp(pattern)) {
        validationError = 'Invalid regex pattern';
      }
    } else {
      const first = parseFloat(firstOperand);
      const second = isUnaryOp ? 0 : parseFloat(secondOperand);

      if (isNaN(first) || (!isUnaryOp && isNaN(second))) {
        validationError = 'Please enter valid numbers';
      } else {
        mutate({ operation, firstOperand: first, secondOperand: second });
        return;
      }
    }

    if (validationError) {
      notifyError(validationError);
      return;
    }

    mutate({ operation, pattern, text });
  };

  const handleOperationChange = (e) => {
    setOperation(Number(e.target.value));
  };

  const handlePatternChange = (e) => setPattern(e.target.value);

  const handleTextChange = (e) => setText(e.target.value);

  const handleFirstOperandChange = (e) => setFirstOperand(e.target.value);

  const handleSecondOperandChange = (e) => setSecondOperand(e.target.value);

  return (
    <Section>
      <SectionHeader title="Calculator" />
      <Form onSubmit={handleCalculate}>
        <FormGroup>
          <FormLabel>Operation</FormLabel>
          <FormSelect
            value={operation}
            onChange={handleOperationChange}
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
                onChange={handlePatternChange}
                placeholder="Enter regex pattern (e.g., \d+)"
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Text to Search</FormLabel>
              <FormInput
                as="textarea"
                value={text}
                onChange={handleTextChange}
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
                onChange={handleFirstOperandChange}
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
                onChange={handleSecondOperandChange}
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

      {hasAsyncState && (
        <AsyncContent
          isLoading={isPending}
          loadingMessage="Calculating..."
        >
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