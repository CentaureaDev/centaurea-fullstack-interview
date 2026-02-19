import Fuse from 'fuse.js';
import { useVirtualizer } from '@tanstack/react-virtual';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import ComputedTimeModal from '../components/ComputedTimeModal';
import { OperationNames, OperationSymbols, UnaryOperations, useClearHistory, useExpressionHistory, useUpdateComputedTime } from '../features/expressions';
import { formatDate, getNowLocalInputValue, isFutureDateValue, toLocalDateTimeInputValue } from '../utils/dateUtils';

const MAX_PAGE_SIZE = 2147483647;

function highlightByIndices(text, indices) {
  if (!indices || indices.length === 0 || !text) return text;
  const str = String(text);
  const parts = [];
  let lastIndex = 0;
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  for (const [start, end] of sorted) {
    if (start > lastIndex) parts.push(str.slice(lastIndex, start));
    parts.push(<mark key={start}>{str.slice(start, end + 1)}</mark>);
    lastIndex = end + 1;
  }
  if (lastIndex < str.length) parts.push(str.slice(lastIndex));
  return parts.length > 0 ? parts : str;
}

const FUSE_KEYS = [
  { name: 'expressionText', weight: 1 },
  { name: 'operationLabel', weight: 1 },
  { name: 'userEmail', weight: 1 },
];

function HistoryPage() {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [search, setSearch] = useState('');
  const debouncedSearch = useDeferredValue(search);

  // Hooks - Data & Mutations
  const { data: history = [], isLoading, isFetching, isError, error, refetch } = useExpressionHistory(MAX_PAGE_SIZE);
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

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected record(s)?`)) return;
    // TODO: call delete mutation when backend support is added
    setRowSelection({});
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

  // Enrich each history item with a human-readable operation label for fuzzy search
  const fuseData = useMemo(
    () => history.map((item) => ({
      ...item,
      operationLabel: `${OperationSymbols[item.operation] ?? ''} ${OperationNames[item.operation] ?? item.operation}`.trim(),
    })),
    [history]
  );

  // Fuzzy search across Expression, Operation, and User Email using fuse.js
  const fuseResults = useMemo(() => {
    if (!debouncedSearch.trim()) return null;
    const fuse = new Fuse(fuseData, {
      keys: FUSE_KEYS,
      includeMatches: true,
      threshold: 0.4,
      minMatchCharLength: 1,
    });
    return fuse.search(debouncedSearch.trim());
  }, [fuseData, debouncedSearch]);

  const matchesById = useMemo(() => {
    if (!fuseResults) return {};
    const map = {};
    for (const result of fuseResults) {
      map[result.item.id] = result.matches ?? [];
    }
    return map;
  }, [fuseResults]);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        size: 40
      },
      {
        header: 'Expression',
        accessorKey: 'expressionText',
        cell: (info) => {
          const m = matchesById[info.row.id]?.find((match) => match.key === 'expressionText');
          return highlightByIndices(info.getValue(), m?.indices);
        }
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
          const text = `${symbol} ${name}`.trim();
          const hasMatch = matchesById[info.row.id]?.some((match) => match.key === 'operationLabel');
          return hasMatch ? <mark>{text}</mark> : text;
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
        cell: (info) => {
          const email = info.getValue() ?? 'anonymous';
          const m = matchesById[info.row.id]?.find((match) => match.key === 'userEmail');
          return highlightByIndices(email, m?.indices);
        }
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
      startEdit,
      matchesById
    ]
  );

  const filteredHistory = useMemo(() => {
    if (!debouncedSearch.trim() || !fuseResults) return history;
    return fuseResults.map((r) => r.item);
  }, [history, debouncedSearch, fuseResults]);

  const table = useReactTable({
    data: filteredHistory,
    columns,
    state: { rowSelection },
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const rows = table.getRowModel().rows;

  const tableContainerRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 41,
    overscan: 20
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  const editingRow = history.find((item) => item.id === editingRowId);

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Calculation History</h2>
        <div className="grid__buttons">
          <button type="button" className="button button--primary" onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </button>
          {selectedCount > 0 && (
            <button type="button" className="button button--danger" onClick={handleDeleteSelected}>
              Delete Selected ({selectedCount})
            </button>
          )}
          {history.length > 0 && (
            <button onClick={handleClearHistoryClick} className="button button--secondary" disabled={isClearingHistory}>
              Clear History
            </button>
          )}
        </div>
      </div>

      <div style={{ margin: '16px 0', maxWidth: 480 }}>
        <input
          type="text"
          className="input"
          placeholder="Fuzzy search by expression, operation, or user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
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

      {filteredHistory.length === 0 && !isLoading ? (
        <p className="message message--empty">No calculations yet</p>
      ) : (
        <div className="grid">
          <div className="grid__controls">
            <div className="grid__page-info">
              {filteredHistory.length} records{selectedCount > 0 ? ` · ${selectedCount} selected` : ''}
            </div>
          </div>

          <div ref={tableContainerRef} className="u-overflow-x-auto" style={{ height: '600px', overflow: 'auto' }}>
            <table className="table u-width-full">
              <thead className="table__header" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
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
                {paddingTop > 0 && (
                  <tr>
                    <td colSpan={columns.length} style={{ height: paddingTop }} />
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr key={row.id} className="table__body-row">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="table__body-cell">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr>
                    <td colSpan={columns.length} style={{ height: paddingBottom }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
