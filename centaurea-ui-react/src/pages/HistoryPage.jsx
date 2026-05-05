import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { OperationNames, OperationSymbols, UnaryOperations } from 'centaurea-ui-shared';
import { formatDate, getNowLocalInputValue, isFutureDateValue, toLocalDateTimeInputValue } from 'centaurea-ui-shared/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';
import FormInput from '../components/FormInput';
import FormLabel from '../components/FormLabel';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Section from '../components/Section';
import SectionHeader from '../components/SectionHeader';
import StatusMessage from '../components/StatusMessage';
import Table from '../components/Table';
import { useApi } from '../providers';

function ComputedTimeModal({ isOpen, value, maxValue, isFuture, isSaving, onChange, onCancel, onSave }) {
  const actions = (
    <>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button type="button" variant="primary" onClick={onSave} disabled={!value || isFuture || isSaving}>
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} title="Update Computed Time" onClose={onCancel} actions={actions}>
      <FormGroup>
        <FormLabel>Select a date and time (must be in the past)</FormLabel>
        <FormInput
          type="datetime-local"
          value={value}
          max={maxValue}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
        {isFuture && <div className="modal__hint">Time must be in the past.</div>}
      </FormGroup>
    </Modal>
  );
}

function HistoryPage() {
  const {
    getExpressionHistory: { data: history = [], isLoading, isFetching, isError, error, refetch },
    clearHistory: { mutate: clearHistory, isPending: isClearingHistory },
    updateComputedTime: { mutate: updateComputedTime, isPending: isUpdatingTime },
  } = useApi();

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timeoutId = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleStartEdit = useCallback((row) => {
    setEditingRowId(row.id);
    setEditingValue(toLocalDateTimeInputValue(row.computedTime));
  }, []);

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingValue('');
  };

  const handleUpdateComputedTime = (row) => {
    if (!row || !editingValue) return;

    const selectedDate = new Date(editingValue);
    if (Number.isNaN(selectedDate.getTime())) {
      return;
    }

    if (selectedDate.getTime() > Date.now()) {
      return;
    }

    updateComputedTime({ id: row.id, computedTime: selectedDate.toISOString() }, {
      onSuccess: () => {
        setToastMessage('Computed time updated.');
        handleCancelEdit();
        refetch();
      },
    });
  };

  const handleClearHistoryClick = () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;
    clearHistory(undefined, {
      onSuccess: () => {
        setToastMessage('History cleared.');
        refetch();
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        header: 'Expression',
        accessorKey: 'expressionText'
      },
      {
        header: 'Result',
        accessorKey: 'result'
      },
      {
        header: 'Operation',
        accessorKey: 'operation',
        cell: (info) => {
          const op = info.getValue();
          const symbol = OperationSymbols[op] ?? '';
          const name = OperationNames[op] ?? op;
          return `${symbol} ${name}`.trim();
        }
      },
      {
        header: 'First Operand',
        accessorKey: 'firstOperand'
      },
      {
        header: 'Second Operand',
        accessorKey: 'secondOperand',
        cell: (info) => {
          const op = info.row.original.operation;
          return UnaryOperations.includes(op) ? '—' : info.getValue();
        }
      },
      {
        header: 'User',
        accessorKey: 'userEmail',
        cell: (info) => info.getValue() ?? 'anonymous'
      },
      {
        header: 'Computed At',
        accessorKey: 'computedTime',
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              type="button"
              className="button button--link"
              onClick={() => handleStartEdit(row)}
              disabled={isLoading || isUpdatingTime}
            >
              {formatDate(info.getValue()) || '—'}
            </button>
          );
        }
      }
    ],
    [
      isLoading,
      isUpdatingTime,
      handleStartEdit
    ]
  );

  const table = useReactTable({
    data: history,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const editingRow = history.find((item) => item.id === editingRowId);

  return (
    <Section>
      <SectionHeader title="Calculation History">
        <Button type="button" onClick={() => refetch()} disabled={isLoading}>
          Refresh
        </Button>
        {history.length > 0 && (
          <Button variant="secondary" onClick={handleClearHistoryClick} disabled={isClearingHistory}>
            Clear History
          </Button>
        )}
      </SectionHeader>

      <ComputedTimeModal
        isOpen={Boolean(editingRowId)}
        value={editingValue}
        maxValue={getNowLocalInputValue()}
        isFuture={isFutureDateValue(editingValue)}
        isSaving={isUpdatingTime}
        onChange={setEditingValue}
        onCancel={handleCancelEdit}
        onSave={() => handleUpdateComputedTime(editingRow)}
      />

      {toastMessage && <StatusMessage variant="info" className="toast">{toastMessage}</StatusMessage>}
      <AsyncContent
        isFetching={isFetching}
        isError={isError}
        error={error}
        isEmpty={history.length === 0 && !isLoading}
        emptyMessage="No calculations yet"
      >
        <div className="grid">
          <Pagination table={table} totalCount={history.length} />
          <Table table={table} />
        </div>
      </AsyncContent>
    </Section>
  );
}

export default HistoryPage;
