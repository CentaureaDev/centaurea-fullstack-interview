<script setup>
import CustomButton from '@/components/CustomButton.vue';
import CustomForm from '@/components/CustomForm.vue';
import FormGroup from '@/components/FormGroup.vue';
import FormInput from '@/components/FormInput.vue';
import FormLabel from '@/components/FormLabel.vue';
import PageSection from '@/components/PageSection.vue';
import StatusMessage from '@/components/StatusMessage.vue';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { toUiError } from 'centaurea-ui-shared';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const auth = useAuth();
const route = useRoute();
const router = useRouter();
const notification = useNotifications();

const authMode = ref('signin');
const name = ref('');
const email = ref('');
const password = ref('');

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' ? redirect : '/calculator';
});

watch(
  () => auth.isAuthenticated.value,
  (isAuthenticated) => {
    if (isAuthenticated) {
      router.replace(redirectPath.value);
    }
  },
);

const runAsyncOperation = async (action, fallbackMessage) => {
  try {
    return await action();
  } catch (error) {
    notification.notifyError(toUiError(error, fallbackMessage).message);
    return null;
  }
};

const handleRegister = async (event) => {
  event.preventDefault();
  const data = await runAsyncOperation(
    () => auth.register(name.value, email.value, password.value),
    'Registration failed',
  );

  if (!data) {
    return;
  }

  name.value = '';
  email.value = '';
  password.value = '';
};

const handleSignIn = async (event) => {
  event.preventDefault();
  const data = await runAsyncOperation(() => auth.login(email.value, password.value), 'Sign in failed');

  if (!data) {
    return;
  }

  email.value = '';
  password.value = '';
};

const handleShowSignIn = () => {
  authMode.value = 'signin';
};

const handleShowRegister = () => {
  authMode.value = 'register';
};
</script>

<template>
  <PageSection>
    <div class="toggle">
      <button
        type="button"
        class="toggle__button"
        :class="{ 'toggle__button--active': authMode === 'signin' }"
        @click="handleShowSignIn"
      >
        Sign in
      </button>
      <button
        type="button"
        class="toggle__button"
        :class="{ 'toggle__button--active': authMode === 'register' }"
        @click="handleShowRegister"
      >
        Register
      </button>
    </div>

    <StatusMessage v-if="auth.isLoading.value" variant="loading">Loading...</StatusMessage>

    <CustomForm v-if="authMode === 'register'" variant="auth" @submit="handleRegister">
      <FormGroup>
        <FormLabel>Name</FormLabel>
        <FormInput v-model="name" type="text" placeholder="Your name" required />
      </FormGroup>
      <FormGroup>
        <FormLabel>Email</FormLabel>
        <FormInput v-model="email" type="email" placeholder="you@example.com" required />
      </FormGroup>
      <FormGroup>
        <FormLabel>Password</FormLabel>
        <FormInput v-model="password" type="password" placeholder="Create a password" required />
      </FormGroup>
      <CustomButton type="submit" :disabled="auth.isLoading.value">Register</CustomButton>
    </CustomForm>

    <CustomForm v-else variant="auth" @submit="handleSignIn">
      <FormGroup>
        <FormLabel>Email</FormLabel>
        <FormInput v-model="email" type="email" placeholder="you@example.com" required />
      </FormGroup>
      <FormGroup>
        <FormLabel>Password</FormLabel>
        <FormInput v-model="password" type="password" placeholder="Your password" required />
      </FormGroup>
      <CustomButton type="submit" :disabled="auth.isLoading.value">Sign in</CustomButton>
    </CustomForm>
  </PageSection>
</template>
