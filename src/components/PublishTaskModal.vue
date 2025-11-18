<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import InputField from './InputField.vue'
import DropDown from './DropDown.vue'
import type { TaskFormData, TaskPriority } from '../ts/task'
import type { DropDownOption } from '../ts/dropdown'
import { useI18n } from '../ts/i18n'
import { taskApi } from '../utils/api'

defineOptions({
	name: 'PublishTaskModal',
})

const { t } = useI18n()

const emit = defineEmits<{
	(eventName: 'close'): void
	(eventName: 'published'): void
}>()

const isClosing = ref(false)
const isAnimating = ref(false) // 防止快速开关导致的闪顿

// 监听组件挂载，重置关闭状态
onMounted(() => {
	isClosing.value = false
	isAnimating.value = false
})

const formData = ref<TaskFormData>({
	title: '',
	description: '',
	type: 'personal',
	priority: 2,
	deadline: null,
	tags: [],
	maxAcceptCount: 1,
})

const taskTypeOptions = computed<DropDownOption[]>(() => [
	{ value: 'personal', label: t('task.form.type.personal') },
	{ value: 'team', label: t('task.form.type.team') },
])

const priorityOptions = computed<DropDownOption[]>(() => [
	{ value: '1', label: t('task.form.priority.low') },
	{ value: '2', label: t('task.form.priority.medium') },
	{ value: '3', label: t('task.form.priority.high') },
	{ value: '4', label: t('task.form.priority.urgent') },
])

const showMaxAcceptCount = computed(() => formData.value.type === 'team')

const tagsInput = ref('')

const handleClose = () => {
	if (isAnimating.value) return // 如果正在动画中，忽略关闭请求
	isAnimating.value = true
	isClosing.value = true
	// 立即触发 close 事件，让父组件知道要关闭，但保持组件显示直到动画完成
	emit('close')
	// 动画完成后重置状态（虽然组件会被移除，但保持状态一致性）
	setTimeout(() => {
		isAnimating.value = false
		isClosing.value = false
	}, 300)
}

const handleSubmit = async () => {
	// 验证表单
	if (!formData.value.title.trim() || !formData.value.description.trim()) {
		alert(t('task.form.errors.empty'))
		return
	}

	// 处理标签
	const tags = tagsInput.value
		.split(',')
		.map((tag) => tag.trim())
		.filter((tag) => tag)

	// 验证人数上限
	if (formData.value.type === 'team') {
		const maxCount = formData.value.maxAcceptCount
		if (!maxCount || maxCount < 1 || maxCount > 100) {
			alert(t('task.form.errors.maxCount'))
			return
		}
	}

	try {
		await taskApi.createTask({
			title: formData.value.title.trim(),
			description: formData.value.description.trim(),
			type: formData.value.type,
			priority: formData.value.priority,
			deadline: formData.value.deadline || null,
			tags,
			max_accept_count: formData.value.maxAcceptCount,
		})

		// 成功后触发 published 事件
		emit('published')

		// 重置表单
		resetForm()

		// 关闭模态框（带动画）
		handleClose()
	} catch (error) {
		console.error('发布任务失败:', error)
		alert(error instanceof Error ? error.message : t('task.form.errors.publishFailed'))
	}
}

const resetForm = () => {
	formData.value = {
		title: '',
		description: '',
		type: 'personal',
		priority: 2,
		deadline: null,
		tags: [],
		maxAcceptCount: 1,
	}
	tagsInput.value = ''
}

// 监听任务类型变化
watch(
	() => formData.value.type,
	(newType) => {
		if (newType === 'personal') {
			formData.value.maxAcceptCount = 1
		} else if (newType === 'team' && formData.value.maxAcceptCount === 1) {
			formData.value.maxAcceptCount = 3
		}
	},
)

// 点击模态框外部关闭
const handleModalClick = (event: MouseEvent) => {
	if ((event.target as HTMLElement).classList.contains('publish-task-modal')) {
		handleClose()
	}
}
</script>

<template>
	<div
		class="publish-task-modal"
		:class="{ 'publish-task-modal--closing': isClosing }"
		@click="handleModalClick"
	>
		<div class="publish-task-modal__content">
			<div class="publish-task-modal__header">
				<h3>{{ t('task.form.title') }}</h3>
				<button class="publish-task-modal__close" @click="handleClose">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<div class="publish-task-modal__body">
				<form @submit.prevent="handleSubmit">
					<InputField
						v-model="formData.title"
						:label="t('task.form.titleLabel')"
						:placeholder="t('task.form.titlePlaceholder')"
						required
					/>

					<div class="publish-task-modal__field">
						<label class="publish-task-modal__label">
							{{ t('task.form.descriptionLabel') }}
						</label>
						<textarea
							v-model="formData.description"
							class="publish-task-modal__textarea"
							:placeholder="t('task.form.descriptionPlaceholder')"
							rows="4"
							required
						></textarea>
					</div>

					<DropDown
						v-model="formData.type"
						:options="taskTypeOptions"
						:label="t('task.form.typeLabel')"
						:placeholder="t('task.form.typePlaceholder')"
					/>

					<div v-if="showMaxAcceptCount" class="publish-task-modal__field">
						<label class="publish-task-modal__label">
							{{ t('task.form.maxCountLabel') }}
						</label>
						<input
							v-model.number="formData.maxAcceptCount"
							type="number"
							class="publish-task-modal__input"
							min="1"
							max="100"
							:placeholder="t('task.form.maxCountPlaceholder')"
						/>
					</div>

					<DropDown
						:model-value="String(formData.priority)"
						@update:model-value="
							(val) => (formData.priority = Number(val) as TaskPriority)
						"
						:options="priorityOptions"
						:label="t('task.form.priorityLabel')"
						:placeholder="t('task.form.priorityPlaceholder')"
					/>

					<div class="publish-task-modal__field">
						<label class="publish-task-modal__label">
							{{ t('task.form.deadlineLabel') }}
						</label>
						<input
							v-model="formData.deadline"
							type="datetime-local"
							class="publish-task-modal__input"
						/>
					</div>

					<div class="publish-task-modal__field">
						<label class="publish-task-modal__label">
							{{ t('task.form.tagsLabel') }}
						</label>
						<input
							v-model="tagsInput"
							type="text"
							class="publish-task-modal__input"
							:placeholder="t('task.form.tagsPlaceholder')"
						/>
					</div>
				</form>
			</div>

			<div class="publish-task-modal__footer">
				<button
					type="button"
					class="publish-task-modal__btn publish-task-modal__btn--secondary"
					@click="handleClose"
				>
					{{ t('task.form.cancel') }}
				</button>
				<button
					type="button"
					class="publish-task-modal__btn publish-task-modal__btn--primary"
					@click="handleSubmit"
				>
					{{ t('task.form.submit') }}
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped src="../styles/components/publish-task-modal.css"></style>
