<script setup lang="ts">
import { defineOptions, computed } from 'vue'
import type { Task, TaskTabType } from '../ts/task'

defineOptions({
	name: 'TaskCard',
})

const props = defineProps<{
	task: Task
	type: TaskTabType
}>()

const emit = defineEmits<{
	(eventName: 'accept', taskId: string): void
	(eventName: 'complete', taskId: string): void
	(eventName: 'abandon', taskId: string): void
}>()

const isMyTask = computed(() => props.type === 'my-tasks')
const isCompleted = computed(() => props.task.status === 'completed')

const formatDateTime = (date: Date | string | null | undefined): string => {
	if (!date) return ''
	const d = new Date(date)
	return d.toLocaleString('zh-CN', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})
}

const handleAccept = () => {
	emit('accept', props.task.id)
}

const handleComplete = () => {
	emit('complete', props.task.id)
}

const handleAbandon = () => {
	emit('abandon', props.task.id)
}
</script>

<template>
	<div
		class="task-card"
		:class="{
			'task-card--my-task': isMyTask,
			'task-card--completed': isCompleted,
		}"
	>
		<!-- 任务头部 -->
		<div class="task-card__header">
			<div v-if="isMyTask" class="task-card__progress" :class="{ 'task-card__progress--completed': isCompleted }"></div>
			<div class="task-card__title-section">
				<h3 class="task-card__title">{{ task.title }}</h3>
				<div class="task-card__meta">
					<span
						class="task-card__tag"
						:class="{
							'task-card__tag--personal': task.type === 'personal',
							'task-card__tag--team': task.type === 'team',
						}"
					>
						{{ task.type === 'personal' ? '个人任务' : '团体任务' }}
					</span>
					<span
						v-if="isMyTask"
						class="task-card__tag"
						:class="{
							'task-card__tag--inprogress': task.status === 'inProgress',
							'task-card__tag--completed': task.status === 'completed',
						}"
					>
						{{ task.status === 'completed' ? '已完成' : '进行中' }}
					</span>
					<span v-if="task.priority > 3" class="task-card__tag task-card__tag--priority">
						<svg
							class="task-card__tag-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
						</svg>
						高优先级
					</span>
				</div>
			</div>
			<div class="task-card__publisher">
				<div class="task-card__publisher-name">{{ task.publisherName }}</div>
				<div class="task-card__time">{{ formatDateTime(task.createdAt) }}</div>
			</div>
		</div>

		<!-- 任务描述 -->
		<div class="task-card__description">{{ task.description }}</div>

		<!-- 标签和截止时间 -->
		<div class="task-card__tags-deadline">
			<div v-if="task.tags.length > 0" class="task-card__tags">
				<span
					v-for="tag in task.tags"
					:key="tag"
					class="task-card__tag"
				>
					<svg
						class="task-card__tag-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
						<line x1="7" y1="7" x2="7.01" y2="7"></line>
					</svg>
					{{ tag }}
				</span>
			</div>
			<div v-if="task.deadline" class="task-card__deadline">
				<svg
					class="task-card__deadline-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
				</svg>
				截止: {{ formatDateTime(task.deadline) }}
			</div>
		</div>

		<!-- 任务底部 -->
		<div class="task-card__footer">
			<div class="task-card__footer-left">
				<div
					v-if="!isMyTask && task.type === 'team'"
					class="task-card__team-info"
				>
					<svg
						class="task-card__team-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
						<circle cx="9" cy="7" r="4"></circle>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
					</svg>
					<span>{{ task.acceptedCount }}/{{ task.maxAcceptCount || '∞' }} 人已接取</span>
				</div>
			</div>
			<div class="task-card__actions">
				<!-- 待接取任务的操作 -->
				<template v-if="type === 'available'">
					<button
						v-if="!task.isAccepted"
						class="task-card__btn task-card__btn--accept"
						@click="handleAccept"
					>
						<svg
							class="task-card__btn-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						接取任务
					</button>
					<div v-else class="task-card__badge">
						<svg
							class="task-card__btn-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						已接取
					</div>
				</template>

				<!-- 我的任务的操作 -->
				<template v-else-if="isMyTask">
					<div v-if="isCompleted" class="task-card__badge">
						<svg
							class="task-card__btn-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						已完成
					</div>
					<template v-else>
						<button
							class="task-card__btn task-card__btn--complete"
							@click="handleComplete"
						>
							<svg
								class="task-card__btn-icon"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
							完成
						</button>
						<button
							class="task-card__btn task-card__btn--abandon"
							@click="handleAbandon"
						>
							<svg
								class="task-card__btn-icon"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
							放弃
						</button>
					</template>
				</template>
			</div>
		</div>
	</div>
</template>

<style scoped src="../styles/components/task-card.css"></style>

