<script setup>
import CustomButton from '@/components/CustomButton.vue';
import FormLabel from '@/components/FormLabel.vue';
import FormSelect from '@/components/FormSelect.vue';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const props = defineProps({
  table: {
    type: Object,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
});

defineEmits([]);

const handlePageSizeChange = (event) => {
  props.table.setPageSize(Number(event.target.value));
};
</script>

<template>
  <div class="grid__controls">
    <div class="grid__page-info">
      Page {{ props.table.getState().pagination.pageIndex + 1 }} of {{ props.table.getPageCount() }} ({{ props.totalCount }} records)
    </div>
    <div class="grid__page-size">
      <FormLabel html-for="pagination-page-size">Rows per page</FormLabel>
      <FormSelect id="pagination-page-size" :value="props.table.getState().pagination.pageSize" @change="handlePageSizeChange">
        <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }}</option>
      </FormSelect>
    </div>
    <div class="grid__buttons">
      <CustomButton type="button" variant="secondary" :disabled="!props.table.getCanPreviousPage()" @click="props.table.previousPage()">
        Previous
      </CustomButton>
      <CustomButton type="button" variant="secondary" :disabled="!props.table.getCanNextPage()" @click="props.table.nextPage()">
        Next
      </CustomButton>
    </div>
  </div>
</template>
