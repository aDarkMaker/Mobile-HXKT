<script setup lang="ts">
import { computed, ref } from 'vue'
import DropDown from '../components/DropDown.vue'
import type { DropDownOption } from '../ts/dropdown'
import { useI18n, type Locale } from '../ts/i18n'

const { t, locale, setLocale, availableLocales } = useI18n()

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

const selectedTheme = ref<DropDownOption['value']>('system')
const selectedNotifications = ref<DropDownOption['value']>('all')
</script>

<template>
	<section class="settings-page">
		<h1 class="settings-page__title">{{ t('settings.title') }}</h1>

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
		</div>

		<div class="settings-section">
			<h2>{{ t('settings.sections.notifications') }}</h2>

			<DropDown
				v-model="selectedNotifications"
				:options="notificationOptions"
				:label="t('settings.notification.label')"
				:placeholder="t('settings.notification.placeholder')"
			/>
		</div>
	</section>
</template>

<style scoped src="../styles/pages/settings.css"></style>
