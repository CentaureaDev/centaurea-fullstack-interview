<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">Calculation History</h2>
      <div class="grid__buttons">
        <button
          type="button"
          class="button button--primary"
          :disabled="loading"
          @click="fetchHistory"
        >
          Refresh
        </button>
        <button
          v-if="history.length > 0"
          @click="handleClearHistory"
          class="button button--secondary"
          :disabled="loading"
        >
          Clear History
        </button>
      </div>
    </div>

    <div v-if="error" class="message message--error">{{ error }}</div>
    <div v-if="loading" class="message message--loading">Loading...</div>

    <p v-if="history.length === 0 && !loading" class="message message--empty">
      No calculations yet
    </p>

    <div v-else class="grid">
      <div class="grid__controls">
        <div class="grid__page-info">
          Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }} ({{ history.length }} records)
        </div>
        <div class="grid__page-size">
          <label for="history-page-size">Rows per page</label>
          <select
            id="history-page-size"
            class="form__select"
            :value="table.getState().pagination.pageSize"
            @change="table.setPageSize(Number($event.target.value))"
          >
            <option v-for="size in [10, 20, 50]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="grid__buttons">
          <button
            type="button"
            class="button button--secondary"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            Previous
          </button>
          <button
            type="button"
            class="button button--secondary"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            Next
          </button>
        </div>
      </div>

      <div class="u-overflow-x-auto">
        <table class="table u-width-full">
          <thead class="table__header">
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <th v-for="header in headerGroup.headers" :key="header.id" class="table__header-cell">
                <span v-if="!header.isPlaceholder">
                  <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in table.getRowModel().rows" :key="row.id" class="table__body-row">
              <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="table__body-cell">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { FlexRender, getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';
import { expressionService, OperationNames, OperationSymbols, UnaryOperations } from '../services/expressionService';

const router = useRouter();
const history = ref([]);
const loading = ref(false);
const error = ref(null);
let unsubscribe = null;

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const columns = [
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
];

const table = useVueTable({
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

const handleSignOutAndRedirect = () => {
  authService.signOut();
  appStore.setUser(null);
  appStore.setRedirectMessage('Your session has expired. Please sign in again.');
  router.push('/auth');
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

onMounted(() => {
  unsubscribe = appStore.subscribe((state) => {
    history.value = state.history;
    loading.value = state.loading;
    error.value = state.error;
  });

  fetchHistory();
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>
