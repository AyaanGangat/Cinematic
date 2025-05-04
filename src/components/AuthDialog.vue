<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isLogin ? 'Login' : 'Register' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            :rules="[val => !!val || 'Email is required']"
            :error="!!error"
            :error-message="error"
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            :rules="[val => !!val || 'Password is required']"
            :error="!!error"
          />

          <q-input
            v-if="!isLogin"
            v-model="username"
            label="Username"
            :rules="[val => !!val || 'Username is required']"
            :error="!!error"
          />

          <div class="row justify-center q-mt-md q-mb-md">
            <q-btn
              flat
              :label="isLogin ? 'Create an account' : 'Already have an account?'"
              @click="switchMode"
              class="text-primary"
              style="min-width: 0;"
            />
          </div>
          <div class="row q-mt-sm">
            <q-btn
              :label="isLogin ? 'Login' : 'Register'"
              type="submit"
              color="primary"
              :loading="loading"
              class="full-width"
            />
          </div>

          <div class="text-center q-mt-md">
            <q-separator class="q-mb-md" />
            <q-btn
              color="red"
              icon="fab fa-google"
              label="Sign in with Google"
              @click="loginWithGoogle"
              :loading="loading"
              class="full-width"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { userService } from '../services/userService'

export default defineComponent({
  name: 'AuthDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const show = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    const isLogin = ref(true)
    const email = ref('')
    const password = ref('')
    const username = ref('')
    const error = ref('')
    const loading = ref(false)

    const switchMode = () => {
      isLogin.value = !isLogin.value
      error.value = ''
    }

    const closeDialog = () => {
      show.value = false
      // Reset form
      email.value = ''
      password.value = ''
      username.value = ''
      error.value = ''
    }

    const onSubmit = async () => {
      error.value = ''
      loading.value = true

      try {
        if (isLogin.value) {
          await login()
        } else {
          await register()
        }
        closeDialog()
      } catch (err) {
        error.value = err.message || 'An error occurred during authentication'
      } finally {
        loading.value = false
      }
    }

    const login = async () => {
      console.log('Attempting login with email/password')
      loading.value = true
      error.value = ''
      try {
        await userService.login(email.value, password.value)
        console.log('Login successful')
        closeDialog()
      } catch (error) {
        console.error('Login error:', error)
        error.value = error.message
      } finally {
        loading.value = false
      }
    }

    const register = async () => {
      console.log('Attempting registration')
      loading.value = true
      error.value = ''
      try {
        await userService.register(email.value, password.value)
        console.log('Registration successful')
        closeDialog()
      } catch (error) {
        console.error('Registration error:', error)
        error.value = error.message
      } finally {
        loading.value = false
      }
    }

    const loginWithGoogle = async () => {
      console.log('Attempting Google login')
      loading.value = true
      error.value = ''
      try {
        await userService.loginWithGoogle()
        console.log('Google login successful')
        closeDialog()
      } catch (error) {
        console.error('Google login error:', error)
        error.value = error.message
      } finally {
        loading.value = false
      }
    }

    return {
      show,
      isLogin,
      email,
      password,
      username,
      error,
      loading,
      onSubmit,
      switchMode,
      loginWithGoogle,
      closeDialog
    }
  }
})
</script> 