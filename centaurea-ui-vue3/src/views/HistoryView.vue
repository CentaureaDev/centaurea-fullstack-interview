<script setup>
import AsyncContent from '@/components/AsyncContent.vue';
import CustomButton from '@/components/CustomButton.vue';
import DataTable from '@/components/DataTable.vue';
import FormGroup from '@/components/FormGroup.vue';
import FormInput from '@/components/FormInput.vue';
import FormLabel from '@/components/FormLabel.vue';
import Modal from '@/components/Modal.vue';
import PageSection from '@/components/PageSection.vue';
import PageSectionHeader from '@/components/PageSectionHeader.vue';
import Pagination from '@/components/Pagination.vue';
import { useClearHistory, useExpressionHistory, useUpdateComputedTime } from '@/composables/useApi';
import { useNotifications } from '@/composables/useNotifications';
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import {
  formatDate,
  getNowLocalInputValue,
  isFutureDateValue,
  OperationNames,
  OperationSymbols,
  toLocalDateTimeInputValue,
  UnaryOperations,
} from 'centaurea-ui-shared';
import { computed, h, ref } from 'vue';

const historyQuery = useExpressionHistory();
const clearHistory = useClearHistory();
const updateComputedTime = useUpdateComputedTime();
const notification = useNotifications();

const editingRowId = ref(null);
const editingValue = ref('');

const history = computed(() => historyQuery.data.value ?? []);

const handleRefresh = () => {
  historyQuery.refetch();
};

const handleStartEdit = (row) => {
  editingRowId.value = row.id;
  editingValue.value = toLocalDateTimeInputValue(row.computedTime);
};

const handleCancelEdit = () => {
  editingRowId.value = null;
  editingValue.value = '';
};

const handleUpdateComputedTime = () => {
  if (!editingValue.value || editingRowId.value === null) {
    return;
  }

  const selectedDate = new Date(editingValue.value);
  if (Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() > Date.now()) {
    return;
  }

  updateComputedTime.mutate(
    { id: editingRowId.value, computedTime: selectedDate.toISOString() },
    {
      onSuccess: () => {
        notification.notifyInfo('Computed time updated.');
        handleCancelEdit();
        historyQuery.refetch();
      },
    },
  );
};

const handleClearHistoryClick = () => {
  if (!window.confirm('Are you sure you want to clear all history?')) {
    return;
  }

  clearHistory.mutate(undefined, {
    onSuccess: () => {
      notification.notifyInfo('History cleared.');
      historyQuery.refetch();
    },
  });
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
          disabled: historyQuery.isLoading.value || updateComputedTime.isPending.value,
          onClick: () => handleStartEdit(row),
        },
        formatDate(row.computedTime) || '—',
      );
    },
  },
]);

const table = useVueTable({
  get data() {
    return history.value;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: { pageSize: 10 },
  },
});
</script>

<template>
  <PageSection>
    <PageSectionHeader title="Calculation History">
      <CustomButton type="button" :disabled="historyQuery.isLoading.value" @click="handleRefresh">Refresh</CustomButton>
      <CustomButton
        v-if="history.length > 0"
        type="button"
        variant="secondary"
        :disabled="clearHistory.isPending.value"
        @click="handleClearHistoryClick"
      >
        Clear History
      </CustomButton>
    </PageSectionHeader>

    <Modal v-if="editingRowId !== null" :is-open="true" title="Update Computed Time" @close="handleCancelEdit">
      <FormGroup>
        <FormLabel>Select a date and time (must be in the past)</FormLabel>
        <FormInput
          type="datetime-local"
          :value="editingValue"
          :max="getNowLocalInputValue()"
          @input="editingValue = $event.target.value"
        />
        <div v-if="isFutureDateValue(editingValue)" class="modal__hint">Time must be in the past.</div>
      </FormGroup>

      <template #actions>
        <CustomButton type="button" variant="secondary" :disabled="updateComputedTime.isPending.value" @click="handleCancelEdit">
          Cancel
        </CustomButton>
        <CustomButton
          type="button"
          :disabled="!editingValue || isFutureDateValue(editingValue) || updateComputedTime.isPending.value"
          @click="handleUpdateComputedTime"
        >
          Save Changes
        </CustomButton>
      </template>
    </Modal>

    <AsyncContent
      :is-fetching="historyQuery.isFetching.value"
      :is-error="historyQuery.isError.value"
      :error="historyQuery.error.value"
      :is-empty="history.length === 0 && !historyQuery.isLoading.value"
      empty-message="No calculations yet"
    >
      <div class="grid">
        <Pagination :table="table" :total-count="history.length" />
        <DataTable :table="table" />
      </div>
    </AsyncContent>
  </PageSection>
</template>
