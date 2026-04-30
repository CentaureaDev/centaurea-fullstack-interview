import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ComputedTimeModal from '../components/ComputedTimeModal';
import { OperationNames, OperationSymbols, UnaryOperations, useClearHistory, useExpressionHistory, useUpdateComputedTime } from '../features/expressions';
import { formatDate, getNowLocalInputValue, isFutureDateValue, toLocalDateTimeInputValue } from 'centaurea-ui-shared/utils';

function HistoryPage() {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Hooks - Data & Mutations
  const { data: history = [], isLoading, isFetching, isError, error, refetch } = useExpressionHistory();
  const { mutate: clearHistory, isPending: isClearingHistory } = useClearHistory({
    onSuccess: () => {
      setToastMessage('History cleared.');
      refetch();
    }
  });
  const { mutate: updateComputedTime, isPending: isUpdatingTime } = useUpdateComputedTime({
    onSuccess: () => {
      setToastMessage('Computed time updated.');
      cancelEdit();
      refetch();
    }
  });

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timeoutId = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const startEdit = useCallback((row) => {
    setEditingRowId(row.id);
    setEditingValue(toLocalDateTimeInputValue(row.computedTime));
  }, []);

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingValue('');
  };

  const handleUpdateComputedTime = (row) => {
    if (!row || !editingValue) return;

    const selectedDate = new Date(editingValue);
    if (Number.isNaN(selectedDate.getTime())) {
      // TODO: Display error message to user
      return;
    }

    if (selectedDate.getTime() > Date.now()) {
      // TODO: Display error message to user
      return;
    }

    updateComputedTime({ id: row.id, computedTime: selectedDate.toISOString() });
  };

  const handleClearHistoryClick = () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;
    clearHistory();
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
              onClick={() => startEdit(row)}
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
      startEdit
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
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Calculation History</h2>
        <div className="grid__buttons">
          <button type="button" className="button button--primary" onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </button>
          {history.length > 0 && (
            <button onClick={handleClearHistoryClick} className="button button--secondary" disabled={isClearingHistory}>
              Clear History
            </button>
          )}
        </div>
      </div>

      <ComputedTimeModal
        isOpen={Boolean(editingRowId)}
        value={editingValue}
        maxValue={getNowLocalInputValue()}
        isFuture={isFutureDateValue(editingValue)}
        isSaving={isUpdatingTime}
        onChange={setEditingValue}
        onCancel={cancelEdit}
        onSave={() => handleUpdateComputedTime(editingRow)}
      />

      {toastMessage && <div className="message message--info toast">{toastMessage}</div>}
      {isError && error && <div className="message message--error">{error.message}</div>}
      {!isError && isFetching && <div className="message message--loading">Loading...</div>}

      {history.length === 0 && !isLoading ? (
        <p className="message message--empty">No calculations yet</p>
      ) : (
        <div className="grid">
          <div className="grid__controls">
            <div className="grid__page-info">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({history.length} records)
            </div>
            <div className="grid__page-size">
              <label htmlFor="history-page-size">Rows per page</label>
              <select
                id="history-page-size"
                className="form__select"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid__buttons">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>

          <div className="u-overflow-x-auto">
            <table className="table u-width-full">
              <thead className="table__header">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="table__header-cell">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="table__body-row">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="table__body-cell">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
