<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BottomNav from './components/BottomNav.vue'
import SettingsPage from './pages/SettingsPage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import HomePage from './pages/HomePage.vue'
import TaskPage from './pages/TaskPage.vue'
import FilesPage from './pages/FilesPage.vue'
import LoginPage from './pages/LoginPage.vue'
import type { Announcement, BilibiliDynamic } from './ts/home'
import { useBottomNav } from './ts/useBottomNav'
import { useBackgroundImage } from './ts/background'
import { useAuth } from './ts/auth'

const { activeKey } = useBottomNav()
useBackgroundImage()
const { isAuthenticated } = useAuth()

/**
 * 公告板
 */
const announcements: Announcement[] = [
	{
		id: 'announcement-2025-11-13',
		title: 'HXKTerminal 1.0.0 发布',
		content: '终于终于把这个饼画好了！',
		publishTime: '2025-11-15',
	},
]

/**
 * B站动态数据
 */
const bilibiliDynamics = ref<BilibiliDynamic[]>([])

onMounted(async () => {
	try {
		const response = await fetch('/bilibili-dynamics.json')
		const data = await response.json()
		// 兼容新旧数据结构：如果是数组直接使用，如果是对象则使用 dynamics 字段
		if (Array.isArray(data)) {
			bilibiliDynamics.value = data
		} else if (data.dynamics && Array.isArray(data.dynamics)) {
			bilibiliDynamics.value = data.dynamics
		}
	} catch (error) {
		console.error('Failed to load bilibili dynamics:', error)
	}
})
</script>

<template>
	<div class="app-shell">
		<!-- 未登录时显示登录页面 -->
		<LoginPage v-if="!isAuthenticated" />

		<!-- 已登录时显示主应用 -->
		<template v-else>
			<main class="app-body">
				<HomePage
					v-if="activeKey === 'home'"
					:announcements="announcements"
					:news="bilibiliDynamics"
				/>
				<FilesPage v-if="activeKey === 'files'" />
				<TaskPage v-if="activeKey === 'tasks'" />
				<CalendarPage v-if="activeKey === 'calendar'" />
				<SettingsPage v-if="activeKey === 'settings'" />
			</main>

			<BottomNav />
		</template>
	</div>
</template>

<style scoped src="./styles/app-shell.css"></style>
