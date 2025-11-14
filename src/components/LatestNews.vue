<script setup lang="ts">
import { ref } from 'vue'
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

// 图片加载错误状态
const imageErrors = ref<Record<number, boolean>>({})
// 图片是否为竖版（高度大于宽度）
const isPortrait = ref<Record<number, boolean>>({})

const formatNumber = (num: number | string): string => {
	if (typeof num === 'string') {
		const n = parseInt(num, 10)
		if (isNaN(n)) return num
		num = n
	}
	if (num >= 10000) {
		return `${(num / 10000).toFixed(1)}万`
	}
	return num.toString()
}

const formatPublishTime = (timestamp?: number): string => {
	if (!timestamp) return ''
	const now = new Date()
	const publishDate = new Date(timestamp * 1000) // 转换为毫秒
	const diff = now.getTime() - publishDate.getTime()
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 1) {
		return '刚刚'
	} else if (minutes < 60) {
		return `${minutes}分钟前`
	} else if (hours < 24) {
		return `${hours}小时前`
	} else if (days < 7) {
		return `${days}天前`
	} else {
		return publishDate.toLocaleDateString('zh-CN', {
			month: '2-digit',
			day: '2-digit',
		})
	}
}

const handleImageError = (index: number) => {
	imageErrors.value[index] = true
	console.warn(`图片加载失败: index ${index}`)
}

const handleImageLoad = (event: Event, index: number) => {
	const img = event.target as HTMLImageElement
	if (img.naturalHeight > img.naturalWidth) {
		// 竖版图片
		isPortrait.value[index] = true
	} else {
		// 横版图片
		isPortrait.value[index] = false
	}
}

const getImageUrl = (url: string | undefined): string => {
	if (!url) return ''
	// 将 HTTP 转换为 HTTPS（如果可能）
	if (url.startsWith('http://')) {
		return url.replace('http://', 'https://')
	}
	return url
}

const getImageFitClass = (index: number): string => {
	// 如果还没有检测到，默认使用横版样式
	if (isPortrait.value[index] === undefined) {
		return 'news-cover-landscape'
	}
	return isPortrait.value[index] ? 'news-cover-portrait' : 'news-cover-landscape'
}

const clickNews = (news: BilibiliDynamic, index: number) => {
	emit('news-click', news)
}
</script>

<template>
	<div class="latest-news">
		<div
			v-for="(item, index) in props.news"
			:key="index"
			class="news-item"
			@click="clickNews(item, index)"
		>
			<!-- 封面图片 -->
			<div v-if="item.封面" class="news-cover-wrapper">
				<img
					v-if="!imageErrors[index]"
					:src="getImageUrl(item.封面)"
					:alt="item.标题 || 'B站动态'"
					:class="['news-cover', getImageFitClass(index)]"
					loading="lazy"
					referrerpolicy="no-referrer"
					@error="handleImageError(index)"
					@load="handleImageLoad($event, index)"
				/>
				<!-- 图片加载失败时的占位符 -->
				<div v-else class="news-cover-placeholder">
					<svg
						class="news-cover-placeholder-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
						<circle cx="8.5" cy="8.5" r="1.5"></circle>
						<polyline points="21 15 16 10 5 21"></polyline>
					</svg>
					<span class="news-cover-placeholder-text">图片加载失败</span>
				</div>
				<!-- 视频信息覆盖层 -->
				<div
					v-if="(item.播放量 || item.弹幕数) && !imageErrors[index]"
					class="news-cover-overlay"
				>
					<span v-if="item.播放量" class="news-play-count">
						<svg
							class="news-cover-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polygon points="5 3 19 12 5 21 5 3"></polygon>
						</svg>
						{{ formatNumber(item.播放量) }}
					</span>
					<span v-if="item.弹幕数" class="news-danmaku-count">
						<svg
							class="news-cover-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
						</svg>
						{{ formatNumber(item.弹幕数) }}
					</span>
				</div>
			</div>

			<!-- 内容区域 -->
			<div class="news-content-wrapper" :class="{ 'has-title': item.标题 }">
				<!-- 标题 -->
				<h3 v-if="item.标题" class="news-title">{{ item.标题 }}</h3>

				<!-- 互动数据和发布时间 -->
				<div class="news-stats-wrapper">
					<!-- 互动数据 -->
					<div class="news-stats">
					<div class="news-stat-item">
						<svg
							class="news-stat-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
							></path>
						</svg>
						<span class="news-stat-value">{{ item.点赞数 }}</span>
					</div>
					<div class="news-stat-item">
						<svg
							class="news-stat-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
							></path>
						</svg>
						<span class="news-stat-value">{{ item.评论数 }}</span>
					</div>
					<div class="news-stat-item">
						<svg
							class="news-stat-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M17 1l4 4-4 4"></path>
							<path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
							<path d="M7 23l-4-4 4-4"></path>
							<path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
						</svg>
						<span class="news-stat-value">{{ item.转发数 }}</span>
					</div>
					</div>
					<!-- 发布时间 -->
					<div v-if="item.发布时间" class="news-publish-time">
						{{ formatPublishTime(item.发布时间) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped src="../styles/components/latest-news.css"></style>

