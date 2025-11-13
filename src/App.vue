<script setup lang="ts">
import BottomNav from './components/BottomNav.vue'
import SettingsPage from './pages/SettingsPage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import HomePage from './pages/HomePage.vue'
import type { Announcement } from './ts/home'
import { useBottomNav } from './ts/useBottomNav'
import { useBackgroundImage } from './ts/background'

const { activeKey } = useBottomNav()
useBackgroundImage()

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
</script>

<template>
	<div class="app-shell">
		<main class="app-body">
			<HomePage v-if="activeKey === 'home'" :announcements="announcements" />
			<CalendarPage v-if="activeKey === 'calendar'" />
			<SettingsPage v-if="activeKey === 'settings'" />
		</main>

		<BottomNav />
	</div>
</template>

<style scoped src="./styles/app-shell.css"></style>
