<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import PublishTaskModal from '../components/PublishTaskModal.vue'
import { convertApiTaskToTask, type Task, type TaskTabType } from '../ts/task'
import { useI18n } from '../ts/i18n'
import { taskApi } from '../utils/api'

defineOptions({
	name: 'TaskPage',
})

const { t } = useI18n()

const selectedTab = ref<TaskTabType>('available')
const availableTasks = ref<Task[]>([])
const myTasks = ref<Task[]>([])
const showPublishModal = ref(false)
const isModalClosing = ref(false)
const loading = ref(false)

// 计算属性：任务数量
const availableCount = computed(() => availableTasks.value.length)
const myTasksCount = computed(() => myTasks.value.length)

// 切换标签页
const switchTab = (tab: TaskTabType) => {
	// 立即更新状态，避免延迟
	selectedTab.value = tab
}

// 显示发布任务模态框
const handleShowPublishModal = () => {
	// 防止在关闭动画期间打开
	if (showPublishModal.value || isModalClosing.value) return
	isModalClosing.value = false
	showPublishModal.value = true
}

// 关闭发布任务模态框
const handleClosePublishModal = () => {
	// 如果已经在关闭中，忽略
	if (isModalClosing.value) return
	isModalClosing.value = true
	// 延迟关闭，等待关闭动画完成
	setTimeout(() => {
		showPublishModal.value = false
		isModalClosing.value = false
	}, 300)
}

// 任务发布成功后的回调
const handleTaskPublished = async () => {
	await loadTasks()
}

// 接取任务
const handleAcceptTask = async (taskId: string) => {
	try {
		await taskApi.acceptTask(Number(taskId))
		await loadTasks()
	} catch (error) {
		console.error('接取任务失败:', error)
		alert(error instanceof Error ? error.message : t('task.errors.acceptFailed'))
	}
}

// 完成任务
const handleCompleteTask = async (taskId: string) => {
	try {
		await taskApi.completeTask(Number(taskId))
		await loadTasks()
	} catch (error) {
		console.error('完成任务失败:', error)
		alert(error instanceof Error ? error.message : t('task.errors.completeFailed'))
	}
}

// 放弃任务
const handleAbandonTask = async (taskId: string) => {
	if (!confirm(t('task.abandonConfirm'))) {
		return
	}
	try {
		await taskApi.abandonTask(Number(taskId))
		await loadTasks()
	} catch (error) {
		console.error('放弃任务失败:', error)
		alert(error instanceof Error ? error.message : t('task.errors.abandonFailed'))
	}
}

// 加载任务列表
const loadTasks = async () => {
	loading.value = true
	try {
		const [availableData, myData] = await Promise.all([
			taskApi.getTasks('available'),
			taskApi.getTasks('my'),
		])
		availableTasks.value = availableData.map(convertApiTaskToTask)
		myTasks.value = myData.map(convertApiTaskToTask)
	} catch (error) {
		console.error('加载任务失败:', error)
		alert(error instanceof Error ? error.message : t('task.errors.loadFailed'))
	} finally {
		loading.value = false
	}
}

// 当前显示的任务列表
const currentTasks = computed(() => {
	if (selectedTab.value === 'my-tasks') {
		return myTasks.value
	}
	return availableTasks.value
})

onMounted(() => {
	loadTasks()
})
</script>

<template>
	<section class="task-page">
		<div class="task-page__header">
			<div class="task-page__title">
				<h1>{{ t('task.title') }}</h1>
				<p>{{ t('task.subtitle') }}</p>
			</div>
			<button class="task-page__publish-btn" @click="handleShowPublishModal">
				<svg
					class="task-page__publish-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				<span>{{ t('task.publish') }}</span>
			</button>
		</div>

		<!-- 标签页 -->
		<div class="task-tabs">
			<button
				class="task-tab"
				:class="{ 'task-tab--active': selectedTab === 'available' }"
				@click="switchTab('available')"
				type="button"
			>
				<svg
					class="task-tab__icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
					<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
				</svg>
				<span>{{ t('task.tabs.available') }}</span>
				<span v-if="availableCount > 0" class="task-tab__badge">
					{{ availableCount }}
				</span>
			</button>
			<button
				class="task-tab"
				:class="{ 'task-tab--active': selectedTab === 'my-tasks' }"
				@click="switchTab('my-tasks')"
				type="button"
			>
				<svg
					class="task-tab__icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M3 3h18v18H3z"></path>
					<path d="M3 9h18"></path>
					<path d="M9 21V9"></path>
				</svg>
				<span>{{ t('task.tabs.myTasks') }}</span>
				<span v-if="myTasksCount > 0" class="task-tab__badge task-tab__badge--danger">
					{{ myTasksCount }}
				</span>
			</button>
		</div>

		<!-- 任务列表 -->
		<div class="task-content">
			<div v-if="loading" class="task-loading">
				{{ t('task.loading') }}
			</div>
			<div v-else-if="currentTasks.length === 0" class="task-empty">
				<div class="task-empty__icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 3h18v18H3z"></path>
						<path d="M3 9h18"></path>
						<path d="M9 21V9"></path>
					</svg>
				</div>
				<h3>{{ t('task.empty.title') }}</h3>
				<p>{{ t('task.empty.description') }}</p>
			</div>
			<div v-else class="task-list">
				<TaskCard
					v-for="task in currentTasks"
					:key="task.id"
					:task="task"
					:type="selectedTab"
					@accept="handleAcceptTask"
					@complete="handleCompleteTask"
					@abandon="handleAbandonTask"
				/>
			</div>
		</div>

		<!-- 发布任务模态框 -->
		<PublishTaskModal
			v-if="showPublishModal || isModalClosing"
			@close="handleClosePublishModal"
			@published="handleTaskPublished"
		/>
	</section>
</template>

<style scoped src="../styles/pages/task.css"></style>
