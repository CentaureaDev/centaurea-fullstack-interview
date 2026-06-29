<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport v-if="props.isOpen" to="body">
    <div class="modal-overlay" @click="handleClose">
      <div class="modal" @click.stop>
        <h3 class="modal__title">{{ props.title }}</h3>
        <div class="modal__content">
          <slot />
        </div>
        <div v-if="$slots.actions" class="modal__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
