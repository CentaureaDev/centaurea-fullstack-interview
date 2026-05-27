<script setup>
import { onErrorCaptured, ref } from 'vue';
import CustomButton from '@/components/CustomButton.vue';
import PageSection from '@/components/PageSection.vue';
import PageSectionHeader from '@/components/PageSectionHeader.vue';
import StatusMessage from '@/components/StatusMessage.vue';

const hasError = ref(false);

onErrorCaptured((error) => {
  console.error('Unhandled render error:', error);
  hasError.value = true;
  return false;
});

const handleTryAgain = () => {
  hasError.value = false;
};
</script>

<template>
  <PageSection v-if="hasError">
    <PageSectionHeader title="Something went wrong" />
    <StatusMessage variant="error">
      An unexpected UI error occurred. Please try again.
    </StatusMessage>
    <CustomButton type="button" @click="handleTryAgain">Try Again</CustomButton>
  </PageSection>
  <slot v-else />
</template>