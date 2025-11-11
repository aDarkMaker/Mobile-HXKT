<script setup lang="ts">
import { ref } from 'vue'
import DropDown from '../components/DropDown.vue'
import { type DropDownOption } from '../ts/dropdown'

const languageOptions: DropDownOption[] = [
	{
		value: 'zh-CN',
		label: '简体中文',
	},
	{
		value: 'en-US',
		label: 'English',
	},
]

const themeOptions: DropDownOption[] = [
	{
		value: 'system',
		label: '跟随系统',
	},
	{
		value: 'light',
		label: '浅色主题',
	},
	{
		value: 'dark',
		label: '深色主题',
	},
]

const notificationOptions: DropDownOption[] = [
	{
		value: 'all',
		label: '全部通知',
	},
	{
		value: 'important',
		label: '仅重要通知',
	},
	{
		value: 'mute',
		label: '免打扰',
	},
]

const selectedLanguage = ref<DropDownOption['value']>('zh-CN')
const selectedTheme = ref<DropDownOption['value']>('system')
const selectedNotifications = ref<DropDownOption['value']>('all')
</script>

<template>
	<section class="settings-page">
		<h1 class="settings-page__title">设置</h1>

		<div class="settings-section">
			<h2>显示设置</h2>
			<div class="settings-grid">
				<DropDown
					v-model="selectedLanguage"
					:options="languageOptions"
					label="系统语言"
					placeholder="请选择语言"
				/>

				<DropDown
					v-model="selectedTheme"
					:options="themeOptions"
					label="主题显示"
					placeholder="请选择主题"
				/>
			</div>
		</div>

		<div class="settings-section">
			<h2>通知设置</h2>

			<DropDown
				v-model="selectedNotifications"
				:options="notificationOptions"
				label="通知推送"
				placeholder="请选择通知推送方式"
			/>
		</div>
	</section>
</template>

<style scoped src="../styles/pages/settings.css"></style>
