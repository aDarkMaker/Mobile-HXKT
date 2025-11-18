<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DropDown from '../components/DropDown.vue'
import InputField from '../components/InputField.vue'
import SettingsVersionInfo from '../components/SettingsVersionInfo.vue'
import SettingsBackgroundPicker from '../components/SettingsBackgroundPicker.vue'
import type { DropDownOption } from '../ts/dropdown'
import { useI18n, type Locale } from '../ts/i18n'
import { useTheme, type ThemeMode } from '../ts/theme'
import { useAccount } from '../ts/account'
import { useAuth } from '../ts/auth'

const { t, locale, setLocale, availableLocales } = useI18n()
const { mode: themeMode, setMode: setThemeMode } = useTheme()
const { account, updateProfile, setAvatar, updatePassword } = useAccount()
const { currentUser, logout } = useAuth()
const APP_VERSION = '1.0.0'

const languageOptions = computed<DropDownOption[]>(() =>
	availableLocales.value.map((value) => ({
		value,
		label: t(`settings.language.options.${value}`),
	})),
)

const themeOptions = computed<DropDownOption[]>(() => [
	{ value: 'system', label: t('settings.theme.options.system') },
	{ value: 'light', label: t('settings.theme.options.light') },
	{ value: 'dark', label: t('settings.theme.options.dark') },
])

const notificationOptions = computed<DropDownOption[]>(() => [
	{ value: 'all', label: t('settings.notification.options.all') },
	{ value: 'important', label: t('settings.notification.options.important') },
	{ value: 'mute', label: t('settings.notification.options.mute') },
])

const selectedLanguage = computed<DropDownOption['value']>({
	get: () => locale.value,
	set: (value) => setLocale(value as Locale),
})

const selectedTheme = computed<DropDownOption['value']>({
	get: () => themeMode.value,
	set: (value) => setThemeMode(value as ThemeMode),
})
const selectedNotifications = ref<DropDownOption['value']>('all')

// 账号相关状态
const showPasswordForm = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

const avatarFileInput = ref<HTMLInputElement | null>(null)

watch(
	() => currentUser.value,
	(user) => {
		if (!user) return
		account.value.username = user.username
		account.value.nickname = user.nickname ?? user.username
	},
	{ immediate: true },
)

const handleAvatarUpload = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (!file) return

	if (!file.type.startsWith('image/')) {
		alert('请选择图片文件')
		return
	}

	const reader = new FileReader()
	reader.onload = (e) => {
		const result = e.target?.result as string
		setAvatar(result)
	}
	reader.readAsDataURL(file)
}

const handleAvatarRemove = () => {
	setAvatar(null)
	if (avatarFileInput.value) {
		avatarFileInput.value.value = ''
	}
}

const handlePasswordChange = async () => {
	passwordError.value = ''

	if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
		passwordError.value = t('settings.account.password.errors.empty')
		return
	}

	if (newPassword.value !== confirmPassword.value) {
		passwordError.value = t('settings.account.password.errors.mismatch')
		return
	}

	if (newPassword.value.length < 6) {
		passwordError.value = t('settings.account.password.errors.tooShort')
		return
	}

	try {
		await updatePassword(oldPassword.value, newPassword.value)
		oldPassword.value = ''
		newPassword.value = ''
		confirmPassword.value = ''
		showPasswordForm.value = false
		alert(t('settings.account.password.success'))
	} catch (error) {
		passwordError.value = t('settings.account.password.errors.failed')
		console.error('Password change failed:', error)
	}
}
</script>

<template>
	<section class="settings-page">
		<h1 class="settings-page__title">{{ t('settings.title') }}</h1>

		<!-- 账号管理 -->
		<div class="settings-section">
			<h2>{{ t('settings.sections.account') }}</h2>

			<!-- 头像设置 -->
			<div class="settings-avatar">
				<div class="settings-avatar__preview">
					<img
						v-if="account.avatar"
						:src="account.avatar"
						:alt="t('settings.account.avatar.label')"
						class="settings-avatar__image"
					/>
					<div v-else class="settings-avatar__placeholder">
						{{ account.nickname?.charAt(0)?.toUpperCase() || 'U' }}
					</div>
				</div>
				<div class="settings-avatar__actions">
					<input
						ref="avatarFileInput"
						type="file"
						accept="image/*"
						class="settings-avatar__input"
						@change="handleAvatarUpload"
					/>
					<button
						type="button"
						class="settings-avatar__btn"
						@click="avatarFileInput?.click()"
					>
						{{
							account.avatar
								? t('settings.account.avatar.change')
								: t('settings.account.avatar.upload')
						}}
					</button>
					<button
						v-if="account.avatar"
						type="button"
						class="settings-avatar__btn settings-avatar__btn--danger"
						@click="handleAvatarRemove"
					>
						{{ t('settings.account.avatar.remove') }}
					</button>
				</div>
			</div>

			<!-- 账号信息 -->
			<div class="settings-fields">
				<InputField
					v-model="account.username"
					:label="t('settings.account.username.label')"
					:placeholder="t('settings.account.username.placeholder')"
					@blur="updateProfile({ username: account.username })"
				/>

				<InputField
					v-model="account.nickname"
					:label="t('settings.account.nickname.label')"
					:placeholder="t('settings.account.nickname.placeholder')"
					@blur="updateProfile({ nickname: account.nickname })"
				/>

				<InputField
					v-model="account.qq"
					:label="t('settings.account.qq.label')"
					:placeholder="t('settings.account.qq.placeholder')"
					type="number"
					@blur="updateProfile({ qq: account.qq })"
				/>
			</div>

			<!-- 密码修改 -->
			<div class="settings-password">
				<Transition name="password-form" mode="out-in">
					<button
						v-if="!showPasswordForm"
						key="toggle"
						type="button"
						class="settings-password__toggle"
						@click="showPasswordForm = true"
					>
						{{ t('settings.account.password.change') }}
					</button>

					<div v-else key="form" class="settings-password__form">
						<InputField
							v-model="oldPassword"
							:label="t('settings.account.password.label')"
							:placeholder="t('settings.account.password.oldPlaceholder')"
							type="password"
							autocomplete="current-password"
						/>

						<InputField
							v-model="newPassword"
							:placeholder="t('settings.account.password.newPlaceholder')"
							type="password"
							autocomplete="new-password"
							:error="passwordError"
						/>

						<InputField
							v-model="confirmPassword"
							:placeholder="t('settings.account.password.confirmPlaceholder')"
							type="password"
							autocomplete="new-password"
						/>

						<div class="settings-password__actions">
							<button
								type="button"
								class="settings-password__btn settings-password__btn--primary"
								@click="handlePasswordChange"
							>
								{{ t('settings.account.password.confirm') }}
							</button>
							<button
								type="button"
								class="settings-password__btn"
								@click="showPasswordForm = false"
							>
								{{ t('settings.account.password.cancel') }}
							</button>
						</div>
					</div>
				</Transition>
			</div>
		</div>

		<!-- 显示设置 -->
		<div class="settings-section">
			<h2>{{ t('settings.sections.display') }}</h2>
			<div class="settings-grid">
				<DropDown
					v-model="selectedLanguage"
					:options="languageOptions"
					:label="t('settings.language.label')"
					:placeholder="t('settings.language.placeholder')"
				/>

				<DropDown
					v-model="selectedTheme"
					:options="themeOptions"
					:label="t('settings.theme.label')"
					:placeholder="t('settings.theme.placeholder')"
				/>
			</div>
			<SettingsBackgroundPicker />
		</div>

		<!-- 应用设置 -->
		<div class="settings-section">
			<h2>{{ t('settings.sections.app') }}</h2>
			<div class="settings-grid">
				<SettingsVersionInfo :version="APP_VERSION" />
			</div>
		</div>

		<!-- 通知设置 -->
		<div class="settings-section">
			<h2>{{ t('settings.sections.notifications') }}</h2>
			<div class="settings-grid">
				<DropDown
					v-model="selectedNotifications"
					:options="notificationOptions"
					:label="t('settings.notification.label')"
					:placeholder="t('settings.notification.placeholder')"
				/>
			</div>
		</div>

		<!-- 退出登录 -->
		<div class="settings-section">
			<button type="button" class="settings-logout" @click="logout">
				{{ t('settings.logout') }}
			</button>
		</div>
	</section>
</template>

<style scoped src="../styles/pages/settings.css"></style>
