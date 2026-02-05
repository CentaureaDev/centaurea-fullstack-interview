import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';
import { expressionService, OperationNames, OperationSymbols, UnaryOperations } from '../services/expressionService';

function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
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
        cell: (info) => formatDate(info.getValue())
      }
    ],
    []
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
