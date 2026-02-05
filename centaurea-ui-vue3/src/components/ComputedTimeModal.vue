<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="emitCancel">
      <div class="modal" @click.stop>
        <h3 class="modal__title">Update Computed Time</h3>
        <div class="modal__content">
          <div class="form__group">
            <label class="form__label">Select a date and time (must be in the past)</label>
            <input
              type="datetime-local"
              class="form__input"
              :value="modelValue"
              :max="maxValue"
              @input="onInput"
              ref="inputRef"
            />
            <div v-if="isFuture" class="modal__hint">Time must be in the past.</div>
          </div>
        </div>
        <div class="modal__actions">
          <button
            type="button"
            class="button button--secondary"
            :disabled="isSaving"
            @click="emitCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="button button--primary"
            :disabled="!modelValue || isFuture || isSaving"
            @click="emitSave"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxValue: {
    type: String,
    default: ''
  },
  isFuture: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'cancel', 'save']);

const inputRef = ref(null);

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
});

const onInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const emitCancel = () => emit('cancel');
const emitSave = () => emit('save');
</script>
