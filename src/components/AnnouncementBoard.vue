<script setup lang="ts">
import type { Announcement } from '../ts/home'

defineOptions({
	name: 'AppAnnouncementBoard',
})

const props = defineProps<{
	announcements?: Announcement[]
}>()

const emit = defineEmits<{
	(eventName: 'announcement-click', announcement: Announcement): void
}>()

const formatTime = (date: Date | string): string => {
	const d = new Date(date)
	return d.toLocaleDateString('zh-CN', {
		month: '2-digit',
		day: '2-digit',
	})
}

const clickAnnouncement = (announcement: Announcement) => {
	emit('announcement-click', announcement)
}
</script>

<template>
	<div class="announcement-board">
		<div
			v-for="announcement in props.announcements"
			:key="announcement.id"
			class="announcement-item"
			:class="announcement.priority"
			@click="clickAnnouncement(announcement)"
		>
			<div class="announcement-header">
				<h3 class="announcement-title">{{ announcement.title }}</h3>
				<span class="announcement-time">{{ formatTime(announcement.publishTime) }}</span>
			</div>
			<p class="announcement-content">{{ announcement.content }}</p>
		</div>
	</div>
</template>

<style scoped src="../styles/components/announcement-board.css"></style>
