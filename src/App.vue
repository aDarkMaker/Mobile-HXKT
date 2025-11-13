<script setup lang="ts">
import BottomNav from './components/BottomNav.vue'
import SettingsPage from './pages/SettingsPage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import HomePage from './pages/HomePage.vue'
import { useBottomNav } from './ts/useBottomNav'

const { activeKey } = useBottomNav()
</script>

<template>
	<div class="app-shell">
		<main class="app-body">
			<HomePage v-if="activeKey === 'home'" />
			<CalendarPage v-if="activeKey === 'calendar'" />
			<SettingsPage v-if="activeKey === 'settings'" />
		</main>

		<BottomNav />
	</div>
</template>

<style scoped src="./styles/app-shell.css"></style>
