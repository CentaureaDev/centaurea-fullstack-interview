<script setup>
import { FlexRender } from '@tanstack/vue-table';

const props = defineProps({
  table: {
    type: Object,
    required: true,
  },
});

defineEmits([]);
</script>

<template>
  <div class="u-overflow-x-auto">
    <table class="table u-width-full">
      <thead class="table__header">
        <tr v-for="headerGroup in props.table.getHeaderGroups()" :key="headerGroup.id">
          <th v-for="header in headerGroup.headers" :key="header.id" class="table__header-cell">
            <span v-if="!header.isPlaceholder">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in props.table.getRowModel().rows" :key="row.id" class="table__body-row">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="table__body-cell">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
