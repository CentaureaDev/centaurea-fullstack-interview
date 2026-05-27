<script setup>
import AsyncContent from '@/components/AsyncContent.vue';
import Card from '@/components/Card.vue';
import CustomButton from '@/components/CustomButton.vue';
import PageSection from '@/components/PageSection.vue';
import PageSectionHeader from '@/components/PageSectionHeader.vue';
import { useExpressionSamples } from '@/composables/useApi';
import { formatDate } from 'centaurea-ui-shared';
import { computed } from 'vue';

const samplesQuery = useExpressionSamples();
const samples = computed(() => samplesQuery.data.value ?? []);

const handleRefresh = () => {
  samplesQuery.refetch();
};
</script>

<template>
  <PageSection>
    <PageSectionHeader title="Sample Expressions">
      <CustomButton type="button" :disabled="samplesQuery.isFetching.value" @click="handleRefresh">Refresh</CustomButton>
    </PageSectionHeader>

    <AsyncContent
      :is-fetching="samplesQuery.isFetching.value"
      :is-error="samplesQuery.isError.value"
      :error="samplesQuery.error.value"
      :is-empty="samples.length === 0"
      empty-message="No sample expressions available"
    >
      <ul class="list list--items">
        <Card v-for="item in samples" :key="item.id" as="li" variant="item">
          <div class="card__expression">{{ item.expressionText }}</div>
          <div class="card__result">{{ item.result }}</div>
          <div class="card__time">{{ formatDate(item.computedTime) }}</div>
        </Card>
      </ul>
    </AsyncContent>
  </PageSection>
</template>
