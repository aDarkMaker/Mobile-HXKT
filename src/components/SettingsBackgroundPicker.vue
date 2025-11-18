<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../ts/i18n'
import { useBackgroundImage } from '../ts/background'

const { t } = useI18n()
const {
	backgroundImage,
	backgroundPosition,
	setBackgroundImage,
	setBackgroundPosition,
	clearBackgroundImage,
} = useBackgroundImage()

const fileInput = ref<HTMLInputElement | null>(null)
const previewContainer = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imagePosition = ref({ x: 50, y: 50 }) // 百分比位置，默认居中
const previewPosition = ref({ x: 50, y: 50 }) // 预览位置，用于拖动时实时显示

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// 节流函数
let rafId: number | null = null
const throttleUpdate = (callback: () => void) => {
	if (rafId !== null) {
		cancelAnimationFrame(rafId)
	}
	rafId = requestAnimationFrame(() => {
		callback()
		rafId = null
	})
}

// 解析背景位置字符串为百分比
const parsePosition = (position: string): { x: number; y: number } => {
	const parts = position.split(' ')
	if (parts.length === 2 && parts[0] && parts[1]) {
		const x = parsePercentage(parts[0])
		const y = parsePercentage(parts[1])
		return { x, y }
	}
	return { x: 50, y: 50 }
}

// 解析百分比字符串或关键字
const parsePercentage = (value: string): number => {
	if (value.includes('%')) {
		return parseFloat(value)
	}
	// 处理关键字
	const keywords: Record<string, number> = {
		left: 0,
		center: 50,
		right: 100,
		top: 0,
		bottom: 100,
	}
	return keywords[value] ?? 50
}

// 将百分比转换为 CSS 位置字符串
const formatPosition = (x: number, y: number): string => {
	return `${x}% ${y}%`
}

// 监听背景位置变化，同步到图片位置
watch(
	backgroundPosition,
	(newPosition) => {
		if (newPosition && !isDragging.value) {
			const parsed = parsePosition(newPosition)
			imagePosition.value = parsed
			previewPosition.value = parsed
		}
	},
	{ immediate: true },
)

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
			// 重置位置为居中
			imagePosition.value = { x: 50, y: 50 }
			setBackgroundPosition(formatPosition(50, 50))
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
	imagePosition.value = { x: 50, y: 50 }
}

// 图片预览样式 - 拖动时使用预览位置，否则使用实际位置
const previewImageStyle = computed(() => {
	if (!backgroundImage.value) return {}
	const position = isDragging.value ? previewPosition.value : imagePosition.value
	return {
		backgroundImage: `url(${backgroundImage.value})`,
		backgroundPosition: formatPosition(position.x, position.y),
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	}
})

// 位置指示器样式
const indicatorStyle = computed(() => {
	const position = isDragging.value ? previewPosition.value : imagePosition.value
	return {
		left: `${position.x}%`,
		top: `${position.y}%`,
	}
})

// 拖动处理
const handleMouseDown = (event: MouseEvent) => {
	if (!backgroundImage.value || !previewContainer.value) return
	isDragging.value = true
	const rect = previewContainer.value.getBoundingClientRect()
	dragStart.value = {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	}
	event.preventDefault()
}

const handleMouseMove = (event: MouseEvent) => {
	if (!isDragging.value || !previewContainer.value) return

	throttleUpdate(() => {
		const rect = previewContainer.value!.getBoundingClientRect()
		const x = ((event.clientX - rect.left) / rect.width) * 100
		const y = ((event.clientY - rect.top) / rect.height) * 100

		// 限制在 0-100% 范围内，只更新预览位置
		previewPosition.value = {
			x: Math.max(0, Math.min(100, x)),
			y: Math.max(0, Math.min(100, y)),
		}
	})
}

const handleMouseUp = () => {
	if (isDragging.value) {
		// 拖动结束时，同步预览位置到实际位置并更新背景
		imagePosition.value = { ...previewPosition.value }
		setBackgroundPosition(formatPosition(imagePosition.value.x, imagePosition.value.y))
		isDragging.value = false
	}
}

// 触摸事件处理
const handleTouchStart = (event: TouchEvent) => {
	if (!backgroundImage.value || !previewContainer.value) return
	const touch = event.touches[0]
	if (!touch) return
	isDragging.value = true
	const rect = previewContainer.value.getBoundingClientRect()
	dragStart.value = {
		x: touch.clientX - rect.left,
		y: touch.clientY - rect.top,
	}
	event.preventDefault()
}

const handleTouchMove = (event: TouchEvent) => {
	if (!isDragging.value || !previewContainer.value) return
	const touch = event.touches[0]
	if (!touch) return

	throttleUpdate(() => {
		const rect = previewContainer.value!.getBoundingClientRect()
		const x = ((touch.clientX - rect.left) / rect.width) * 100
		const y = ((touch.clientY - rect.top) / rect.height) * 100

		// 限制在 0-100% 范围内，只更新预览位置
		previewPosition.value = {
			x: Math.max(0, Math.min(100, x)),
			y: Math.max(0, Math.min(100, y)),
		}
	})

	event.preventDefault()
}

const handleTouchEnd = () => {
	if (isDragging.value) {
		// 拖动结束时，同步预览位置到实际位置并更新背景
		imagePosition.value = { ...previewPosition.value }
		setBackgroundPosition(formatPosition(imagePosition.value.x, imagePosition.value.y))
		isDragging.value = false
	}
}

// 添加全局事件监听
onMounted(() => {
	window.addEventListener('mousemove', handleMouseMove)
	window.addEventListener('mouseup', handleMouseUp)
	window.addEventListener('touchmove', handleTouchMove, { passive: false })
	window.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove)
	window.removeEventListener('mouseup', handleMouseUp)
	window.removeEventListener('touchmove', handleTouchMove)
	window.removeEventListener('touchend', handleTouchEnd)
	// 清理未完成的动画帧
	if (rafId !== null) {
		cancelAnimationFrame(rafId)
		rafId = null
	}
})
</script>

<template>
	<div class="settings-background">
		<div class="settings-background__header">
			<h3>{{ t('settings.display.background.label') }}</h3>
		</div>

		<div
			ref="previewContainer"
			class="settings-background__preview"
			:class="{
				'settings-background__preview--empty': !backgroundImage,
				'settings-background__preview--dragging': isDragging,
			}"
			:style="previewImageStyle"
			@mousedown="handleMouseDown"
			@touchstart="handleTouchStart"
		>
			<div v-if="!backgroundImage" class="settings-background__placeholder">
				{{ t('settings.display.background.placeholder') }}
			</div>
			<div
				v-if="backgroundImage"
				class="settings-background__position-indicator"
				:class="{ 'settings-background__position-indicator--visible': isDragging }"
				:style="indicatorStyle"
			></div>
			<div v-if="backgroundImage" class="settings-background__hint">
				{{ t('settings.display.background.positionHint') }}
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
