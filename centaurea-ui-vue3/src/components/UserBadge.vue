<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['sign-out']);

const handleSignOut = () => {
  emit('sign-out');
};
</script>

<template>
  <div class="user-badge">
    <div class="user-badge__info">
      <div class="user-badge__name">{{ props.user.username }}</div>
      <div class="user-badge__email">{{ props.user.email }}</div>
    </div>
    <button class="user-badge__button" @click="handleSignOut">Sign out</button>
  </div>
</template>
