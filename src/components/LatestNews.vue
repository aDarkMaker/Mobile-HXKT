<script setup lang="ts">
import { defineOptions } from 'vue'
import type { BilibiliDynamic } from '../ts/home'

defineOptions({
	name: 'AppLatestNews',
})

const props = defineProps<{
	news?: BilibiliDynamic[]
}>()

const emit = defineEmits<{
	(eventName: 'news-click', news: BilibiliDynamic): void
}>()

const formatTime = (date: Date | string): string => {
	const d = new Date(date)
	const now = new Date()
	const diff = now.getTime() - d.getTime()
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 60) {
		return `${minutes}分钟前`
	} else if (hours < 24) {
		return `${hours}小时前`
	} else if (days < 7) {
		return `${days}天前`
	} else {
		return d.toLocaleDateString('zh-CN', {
			month: '2-digit',
			day: '2-digit',
		})
	}
}

const clickNews = (news: BilibiliDynamic) => {
	emit('news-click', news)
}
</script>

<template>
	<div class="latest-news">
		<div
			v-for="item in props.news"
			:key="item.id"
			class="news-item"
			@click="clickNews(item)"
		>
			<div class="news-header">
				<div class="news-author">
					<img
						v-if="item.authorAvatar"
						:src="item.authorAvatar"
						:alt="item.author"
						class="news-avatar"
					/>
					<div v-else class="news-avatar-placeholder">
						{{ item.author.charAt(0) }}
					</div>
					<span class="news-author-name">{{ item.author }}</span>
				</div>
				<span class="news-time">{{ formatTime(item.publishTime) }}</span>
			</div>
			<h3 class="news-title">{{ item.title }}</h3>
			<p class="news-content">{{ item.content }}</p>
			<div v-if="item.images && item.images.length > 0" class="news-images">
				<img
					v-for="(image, index) in item.images.slice(0, 3)"
					:key="index"
					:src="image"
					:alt="`${item.title} - 图片${index + 1}`"
					class="news-image"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped src="../styles/components/latest-news.css"></style>

