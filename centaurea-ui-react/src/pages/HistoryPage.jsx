import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';
import { expressionService, OperationNames, OperationSymbols, UnaryOperations } from '../services/expressionService';
import ComputedTimeModal from '../components/ComputedTimeModal';

function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
  };

  const toLocalDateTimeInputValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const getNowLocalInputValue = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const isFutureDateValue = (value) => {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return date.getTime() > Date.now();
  };

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timeoutId = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const startEdit = (row) => {
    setEditingRowId(row.id);
    setEditingValue(toLocalDateTimeInputValue(row.computedTime));
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingValue('');
  };

  const handleUpdateComputedTime = async (row) => {
    if (!row || !editingValue) return;

    const selectedDate = new Date(editingValue);
    if (Number.isNaN(selectedDate.getTime())) {
      appStore.setError('Please choose a valid date and time.');
      return;
    }

    if (selectedDate.getTime() > Date.now()) {
      appStore.setError('Computed time cannot be in the future.');
      return;
    }

    setUpdatingId(row.id);
    appStore.setError(null);

    try {
      const updated = await expressionService.updateHistoryComputedTime(row.id, selectedDate.toISOString());
      const nextHistory = history.map((item) =>
        item.id === row.id ? { ...item, computedTime: updated.computedTime ?? item.computedTime } : item
      );
      appStore.setHistory(nextHistory);
      setToastMessage('Computed time updated.');
      cancelEdit();
    } catch (err) {
      if (err.status === 401) {
        handleSignOutAndRedirect();
      } else {
        appStore.setError(err.message || 'Failed to update computed time');
      }
    } finally {
      setUpdatingId(null);
    }
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
              disabled={loading || updatingId === row.id}
            >
              {formatDate(info.getValue()) || '—'}
            </button>
          );
        }
      }
    ],
    [
      formatDate,
      loading,
      startEdit,
      updatingId
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

  useEffect(() => {
    const handleStateChange = (state) => {
      setHistory(state.history);
      setLoading(state.loading);
      setError(state.error);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    
    fetchHistory();

    return unsubscribe;
  }, []);

  const handleSignOutAndRedirect = () => {
    authService.signOut();
    appStore.setUser(null);
    appStore.setRedirectMessage('Your session has expired. Please sign in again.');
    navigate('/auth');
  };

  const fetchHistory = async () => {
    appStore.setLoading(true);
    appStore.setError(null);
    try {
      const data = await expressionService.getHistory();
      appStore.setHistory(data);
    } catch (err) {
      if (err.status === 401) {
        handleSignOutAndRedirect();
      } else {
        appStore.setError(err.message || 'Failed to load history');
      }
    } finally {
      appStore.setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;

    appStore.setLoading(true);
    appStore.setError(null);
    try {
      await expressionService.clearHistory();
      appStore.setHistory([]);
    } catch (err) {
      if (err.status === 401) {
        handleSignOutAndRedirect();
      } else {
        appStore.setError(err.message || 'Failed to clear history');
      }
    } finally {
      appStore.setLoading(false);
    }
  };

  const editingRow = history.find((item) => item.id === editingRowId);

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Calculation History</h2>
        <div className="grid__buttons">
          <button type="button" className="button button--primary" onClick={fetchHistory} disabled={loading}>
            Refresh
          </button>
          {history.length > 0 && (
            <button onClick={handleClearHistory} className="button button--secondary" disabled={loading}>
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
        isSaving={updatingId !== null}
        onChange={setEditingValue}
        onCancel={cancelEdit}
        onSave={() => handleUpdateComputedTime(editingRow)}
      />

      {toastMessage && <div className="message message--info toast">{toastMessage}</div>}
      {error && <div className="message message--error">{error}</div>}
      {loading && <div className="message message--loading">Loading...</div>}

      {history.length === 0 && !loading ? (
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
