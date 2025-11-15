<script setup lang="ts">
import { ref } from 'vue'
import { defineOptions } from 'vue'
import InputField from '../components/InputField.vue'
import { useAuth } from '../ts/auth'
import { useI18n } from '../ts/i18n'

defineOptions({
	name: 'LoginPage',
})

const { t } = useI18n()
const { login, register } = useAuth()

const isLoginMode = ref(true) // true: 登录, false: 注册
const isLoading = ref(false)
const error = ref('')

// 登录表单
const loginUsername = ref('')
const loginPassword = ref('')

// 注册表单
const registerUsername = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const registerNickname = ref('')

const switchMode = () => {
	isLoginMode.value = !isLoginMode.value
	error.value = ''
	// 清空表单
	loginUsername.value = ''
	loginPassword.value = ''
	registerUsername.value = ''
	registerPassword.value = ''
	registerConfirmPassword.value = ''
	registerNickname.value = ''
}

const handleLogin = async () => {
	error.value = ''

	if (!loginUsername.value.trim() || !loginPassword.value.trim()) {
		error.value = t('auth.login.errors.empty')
		return
	}

	isLoading.value = true
	try {
		await login(loginUsername.value.trim(), loginPassword.value)
		// 登录成功，由App.vue处理路由
	} catch (err) {
		error.value = t('auth.login.errors.failed')
		console.error('Login error:', err)
	} finally {
		isLoading.value = false
	}
}

const handleRegister = async () => {
	error.value = ''

	if (
		!registerUsername.value.trim() ||
		!registerPassword.value.trim() ||
		!registerConfirmPassword.value.trim()
	) {
		error.value = t('auth.register.errors.empty')
		return
	}

	if (registerPassword.value !== registerConfirmPassword.value) {
		error.value = t('auth.register.errors.mismatch')
		return
	}

	if (registerPassword.value.length < 6) {
		error.value = t('auth.register.errors.tooShort')
		return
	}

	isLoading.value = true
	try {
		await register(
			registerUsername.value.trim(),
			registerPassword.value,
			registerNickname.value.trim() || undefined,
		)
		// 注册成功，由App.vue处理路由
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<section class="login-page">
		<div class="login-page__container">
			<!-- Logo/标题区域 -->
			<div class="login-page__header">
				<h1 class="login-page__title">{{ t('auth.title') }}</h1>
				<p class="login-page__subtitle">
					{{ isLoginMode ? t('auth.login.subtitle') : t('auth.register.subtitle') }}
				</p>
			</div>

			<!-- 表单区域 -->
			<div class="login-page__form">
				<!-- 登录表单 -->
				<form v-if="isLoginMode" @submit.prevent="handleLogin">
					<InputField
						v-model="loginUsername"
						:label="t('auth.login.usernameLabel')"
						:placeholder="t('auth.login.usernamePlaceholder')"
						autocomplete="username"
						required
						:disabled="isLoading"
					/>

					<InputField
						v-model="loginPassword"
						:label="t('auth.login.passwordLabel')"
						:placeholder="t('auth.login.passwordPlaceholder')"
						type="password"
						autocomplete="current-password"
						required
						:disabled="isLoading"
					/>

					<div v-if="error" class="login-page__error">{{ error }}</div>

					<button type="submit" class="login-page__submit" :disabled="isLoading">
						<span v-if="!isLoading">{{ t('auth.login.submit') }}</span>
						<span v-else>{{ t('auth.loading') }}</span>
					</button>
				</form>

				<!-- 注册表单 -->
				<form v-else @submit.prevent="handleRegister">
					<InputField
						v-model="registerUsername"
						:label="t('auth.register.usernameLabel')"
						:placeholder="t('auth.register.usernamePlaceholder')"
						autocomplete="username"
						required
						:disabled="isLoading"
					/>

					<InputField
						v-model="registerNickname"
						:label="t('auth.register.nicknameLabel')"
						:placeholder="t('auth.register.nicknamePlaceholder')"
						autocomplete="nickname"
						:disabled="isLoading"
					/>

					<InputField
						v-model="registerPassword"
						:label="t('auth.register.passwordLabel')"
						:placeholder="t('auth.register.passwordPlaceholder')"
						type="password"
						autocomplete="new-password"
						required
						:disabled="isLoading"
					/>

					<InputField
						v-model="registerConfirmPassword"
						:label="t('auth.register.confirmPasswordLabel')"
						:placeholder="t('auth.register.confirmPasswordPlaceholder')"
						type="password"
						autocomplete="new-password"
						required
						:disabled="isLoading"
					/>

					<div v-if="error" class="login-page__error">{{ error }}</div>

					<button type="submit" class="login-page__submit" :disabled="isLoading">
						<span v-if="!isLoading">{{ t('auth.register.submit') }}</span>
						<span v-else>{{ t('auth.loading') }}</span>
					</button>
				</form>
			</div>

			<!-- 切换登录/注册 -->
			<div class="login-page__switch">
				<span v-if="isLoginMode">
					{{ t('auth.login.switchText') }}
					<button type="button" class="login-page__switch-btn" @click="switchMode">
						{{ t('auth.login.switchAction') }}
					</button>
				</span>
				<span v-else>
					{{ t('auth.register.switchText') }}
					<button type="button" class="login-page__switch-btn" @click="switchMode">
						{{ t('auth.register.switchAction') }}
					</button>
				</span>
			</div>
		</div>
	</section>
</template>

<style scoped src="../styles/pages/login.css"></style>
