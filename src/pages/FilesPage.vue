<script setup lang="ts">
import { defineOptions } from 'vue'
import { useI18n } from '../ts/i18n'

defineOptions({
	name: 'FilesPage',
})

const { t } = useI18n()
</script>

<template>
	<section class="files-page">
		<div class="files-page__content">
			<div class="files-page__icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
					<polyline points="14 2 14 8 20 8"></polyline>
					<line x1="16" y1="13" x2="8" y2="13"></line>
					<line x1="16" y1="17" x2="8" y2="17"></line>
					<polyline points="10 9 9 9 8 9"></polyline>
				</svg>
			</div>
			<h1 class="files-page__title">{{ t('files.title') }}</h1>
			<p class="files-page__message">{{ t('files.underConstruction') }}</p>
		</div>
	</section>
</template>

<style scoped src="../styles/pages/files.css"></style>

