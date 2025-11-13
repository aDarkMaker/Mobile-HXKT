<script setup lang="ts">
import { useI18n } from '../ts/i18n'

const props = defineProps<{
	version: string
}>()

const { t } = useI18n()
</script>

<template>
	<div class="settings-version">
		<div class="settings-version__header">
			<span class="settings-version__label">{{ t('settings.app.version.label') }}</span>
			<span class="settings-version__badge">{{ t('settings.app.version.currentTag') }}</span>
		</div>
		<div class="settings-version__value">{{ props.version }}</div>
	</div>
</template>

<style scoped src="../styles/components/settings-version-info.css"></style>
