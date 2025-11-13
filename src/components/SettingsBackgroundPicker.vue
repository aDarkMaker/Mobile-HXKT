<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../ts/i18n'
import { useBackgroundImage } from '../ts/background'

const { t } = useI18n()
const { backgroundImage, setBackgroundImage, clearBackgroundImage } = useBackgroundImage()

const fileInput = ref<HTMLInputElement | null>(null)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const triggerUpload = () => {
	fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (!file) return

	if (!file.type.startsWith('image/')) {
		alert(t('settings.display.background.invalidType'))
		resetInput(target)
		return
	}

	if (file.size > MAX_FILE_SIZE) {
		alert(t('settings.display.background.oversize'))
		resetInput(target)
		return
	}

	const reader = new FileReader()
	reader.onload = (e) => {
		const result = e.target?.result
		if (typeof result === 'string') {
			setBackgroundImage(result)
		}
		resetInput(target)
	}
	reader.readAsDataURL(file)
}

const resetInput = (input: HTMLInputElement) => {
	input.value = ''
}

const removeBackground = () => {
	clearBackgroundImage()
}
</script>

<template>
	<div class="settings-background">
		<div class="settings-background__header">
			<h3>{{ t('settings.display.background.label') }}</h3>
		</div>

		<div
			class="settings-background__preview"
			:class="{ 'settings-background__preview--empty': !backgroundImage }"
		>
			<img
				v-if="backgroundImage"
				:src="backgroundImage"
				:alt="t('settings.display.background.label')"
			/>
			<div v-else class="settings-background__placeholder">
				{{ t('settings.display.background.placeholder') }}
			</div>
		</div>

		<div class="settings-background__actions">
			<input
				ref="fileInput"
				type="file"
				accept="image/*"
				class="settings-background__input"
				@change="handleFileChange"
			/>
			<button type="button" class="settings-background__btn" @click="triggerUpload">
				{{
					backgroundImage
						? t('settings.display.background.replace')
						: t('settings.display.background.upload')
				}}
			</button>
			<button
				v-if="backgroundImage"
				type="button"
				class="settings-background__btn settings-background__btn--danger"
				@click="removeBackground"
			>
				{{ t('settings.display.background.remove') }}
			</button>
		</div>
	</div>
</template>

<style scoped src="../styles/components/settings-background-picker.css"></style>
