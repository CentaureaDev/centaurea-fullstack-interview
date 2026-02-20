<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">Calculation History</h2>
      <div class="grid__buttons">
        <button
          type="button"
          class="button button--primary"
          :disabled="isLoading"
          @click="refetch"
        >
          Refresh
        </button>
        <button
          v-if="history.length > 0"
          class="button button--secondary"
          :disabled="isClearingHistory"
          @click="handleClearHistoryClick"
        >
          Clear History
        </button>
      </div>
    </div>

    <div v-if="toastMessage" class="message message--info toast">{{ toastMessage }}</div>
    <div v-if="isError && error" class="message message--error">{{ error.message }}</div>
    <div v-if="!isError && isFetching" class="message message--loading">Loading...</div>

    <ComputedTimeModal
      v-if="editingRowId !== null"
      v-model="editingValue"
      :max-value="getNowLocalInputValue()"
      :is-future="isFutureDateValue(editingValue)"
      :is-saving="isUpdatingTime"
      @cancel="cancelEdit"
      @save="handleUpdateComputedTime"
    />

    <p v-if="history.length === 0 && !isLoading" class="message message--empty">
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
            <option v-for="size in [10, 20, 50]" :key="size" :value="size">{{ size }}</option>
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
import { ref, computed, watch, h } from 'vue';
import { FlexRender, getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { useExpressionHistory } from '../composables/expressions/useExpressionHistory.js';
import { useClearHistory } from '../composables/expressions/useClearHistory.js';
import { useUpdateComputedTime } from '../composables/expressions/useUpdateComputedTime.js';
import { OperationNames, OperationSymbols, UnaryOperations } from '../composables/expressions/index.js';
import { formatDate, getNowLocalInputValue, isFutureDateValue, toLocalDateTimeInputValue } from '../utils/dateUtils.js';
import ComputedTimeModal from '../components/ComputedTimeModal.vue';

const editingRowId = ref(null);
const editingValue = ref('');
const toastMessage = ref(null);
let toastTimeoutId = null;

const { data: historyData, isLoading, isFetching, isError, error, refetch } = useExpressionHistory();
const history = computed(() => historyData.value ?? []);

const { mutate: clearHistory, isPending: isClearingHistory } = useClearHistory({
  onSuccess: () => {
    toastMessage.value = 'History cleared.';
  },
});

const { mutate: updateComputedTime, isPending: isUpdatingTime } = useUpdateComputedTime({
  onSuccess: () => {
    toastMessage.value = 'Computed time updated.';
    cancelEdit();
  },
});

watch(toastMessage, (msg) => {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
    toastTimeoutId = null;
  }
  if (msg) {
    toastTimeoutId = setTimeout(() => {
      toastMessage.value = null;
    }, 3000);
  }
});

const startEdit = (row) => {
  editingRowId.value = row.id;
  editingValue.value = toLocalDateTimeInputValue(row.computedTime);
};

const cancelEdit = () => {
  editingRowId.value = null;
  editingValue.value = '';
};

const handleUpdateComputedTime = () => {
  if (!editingValue.value) return;

  const selectedDate = new Date(editingValue.value);
  if (Number.isNaN(selectedDate.getTime())) return;
  if (selectedDate.getTime() > Date.now()) return;

  updateComputedTime({ id: editingRowId.value, computedTime: selectedDate.toISOString() });
};

const handleClearHistoryClick = () => {
  if (!window.confirm('Are you sure you want to clear all history?')) return;
  clearHistory();
};

const columns = computed(() => [
  { header: 'Expression', accessorKey: 'expressionText' },
  { header: 'Result', accessorKey: 'result' },
  {
    header: 'Operation',
    accessorKey: 'operation',
    cell: (info) => {
      const op = info.getValue();
      const symbol = OperationSymbols[op] ?? '';
      const name = OperationNames[op] ?? op;
      return `${symbol} ${name}`.trim();
    },
  },
  { header: 'First Operand', accessorKey: 'firstOperand' },
  {
    header: 'Second Operand',
    accessorKey: 'secondOperand',
    cell: (info) => {
      const op = info.row.original.operation;
      return UnaryOperations.includes(op) ? '—' : info.getValue();
    },
  },
  {
    header: 'User',
    accessorKey: 'userEmail',
    cell: (info) => info.getValue() ?? 'anonymous',
  },
  {
    header: 'Computed At',
    accessorKey: 'computedTime',
    cell: (info) => {
      const row = info.row.original;
      return h(
        'button',
        {
          type: 'button',
          class: 'button button--link',
          disabled: isLoading.value || isUpdatingTime.value,
          onClick: () => startEdit(row),
        },
        formatDate(row.computedTime) || '—',
      );
    },
  },
]);

const table = useVueTable({
  get data() { return history.value; },
  get columns() { return columns.value; },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: { pageSize: 10 },
  },
});
</script>
