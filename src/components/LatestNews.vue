<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
// 图片加载状态：loading, loaded, error, undefined
const imageLoadingStates = ref<Record<number, 'loading' | 'loaded' | 'error' | undefined>>({})
// 图片是否为竖版（高度大于宽度）
const isPortrait = ref<Record<number, boolean>>({})
// 图片重试次数
const imageRetryCount = ref<Record<number, number>>({})
// 最大重试次数
const MAX_RETRY_COUNT = 2
// 图片加载超时时间（毫秒）
const IMAGE_LOAD_TIMEOUT = 10000

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

// 预加载图片（用于检测图片方向和确保图片可加载）
const preloadImage = (url: string, index: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		// 如果已经在加载中，不重复加载
		if (imageLoadingStates.value[index] === 'loading') {
			return
		}

		const img = new Image()
		const timeoutId = setTimeout(() => {
			img.onload = null
			img.onerror = null
			reject(new Error('图片加载超时'))
		}, IMAGE_LOAD_TIMEOUT)

		img.onload = () => {
			clearTimeout(timeoutId)
			// 检测图片方向
			if (img.naturalHeight > img.naturalWidth) {
				isPortrait.value[index] = true
			} else {
				isPortrait.value[index] = false
			}
			// 预加载成功，但img标签可能还在加载，所以不立即设置为loaded
			resolve()
		}

		img.onerror = () => {
			clearTimeout(timeoutId)
			reject(new Error('图片加载失败'))
		}

		img.crossOrigin = 'anonymous'
		img.referrerPolicy = 'no-referrer'
		img.src = url
		imageLoadingStates.value[index] = 'loading'
	})
}

// 加载图片（带重试机制）
const loadImageWithRetry = async (url: string, index: number) => {
	const currentRetry = imageRetryCount.value[index] || 0

	try {
		await preloadImage(url, index)
		// 预加载成功，图片会被浏览器缓存，img标签加载会很快
	} catch (error) {
		console.warn(
			`图片预加载失败 (尝试 ${currentRetry + 1}/${MAX_RETRY_COUNT + 1}): index ${index}`,
			error,
		)

		if (currentRetry < MAX_RETRY_COUNT) {
			// 重试
			imageRetryCount.value[index] = currentRetry + 1
			// 延迟后重试
			setTimeout(
				() => {
					loadImageWithRetry(url, index)
				},
				1000 * (currentRetry + 1),
			) // 递增延迟
		} else {
			// 达到最大重试次数，仍然允许img标签尝试加载
			imageLoadingStates.value[index] = undefined
		}
	}
}

const handleImageError = (index: number) => {
	const url = props.news?.[index]?.封面
	if (url) {
		const imageUrl = getImageUrl(url)
		const currentRetry = imageRetryCount.value[index] || 0

		if (currentRetry < MAX_RETRY_COUNT) {
			// 重试
			imageRetryCount.value[index] = currentRetry + 1
			setTimeout(
				() => {
					loadImageWithRetry(imageUrl, index)
				},
				1000 * (currentRetry + 1),
			)
		} else {
			imageErrors.value[index] = true
			imageLoadingStates.value[index] = 'error'
			console.warn(`图片加载失败: index ${index}`)
		}
	} else {
		imageErrors.value[index] = true
		imageLoadingStates.value[index] = 'error'
	}
}

const handleImageLoad = (event: Event, index: number) => {
	const img = event.target as HTMLImageElement
	// 确保图片完全加载
	if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
		// 检测图片方向（如果预加载时没有检测到）
		if (isPortrait.value[index] === undefined) {
			if (img.naturalHeight > img.naturalWidth) {
				isPortrait.value[index] = true
			} else {
				isPortrait.value[index] = false
			}
		}
		imageLoadingStates.value[index] = 'loaded'
		imageErrors.value[index] = false
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

const clickNews = (news: BilibiliDynamic) => {
	emit('news-click', news)
}

// 监听news变化，预加载图片
watch(
	() => props.news,
	(news) => {
		if (news && news.length > 0) {
			// 初始化所有图片的加载状态
			news.forEach((item, index) => {
				if (item.封面) {
					// 如果还没有开始加载，则开始加载
					if (!imageLoadingStates.value[index]) {
						const imageUrl = getImageUrl(item.封面)
						loadImageWithRetry(imageUrl, index)
					}
				}
			})
		}
	},
	{ immediate: true },
)

onMounted(() => {
	// 组件挂载后，确保所有图片开始加载
	if (props.news && props.news.length > 0) {
		props.news.forEach((item, index) => {
			if (item.封面 && !imageLoadingStates.value[index]) {
				const imageUrl = getImageUrl(item.封面)
				loadImageWithRetry(imageUrl, index)
			}
		})
	}
})
</script>

<template>
	<div class="latest-news">
		<div
			v-for="(item, index) in props.news"
			:key="index"
			class="news-item"
			@click="clickNews(item)"
		>
			<!-- 封面图片 -->
			<div v-if="item.封面" class="news-cover-wrapper">
				<!-- 加载中状态 -->
				<div v-if="imageLoadingStates[index] === 'loading'" class="news-cover-loading">
					<div class="news-cover-loading-spinner"></div>
					<span class="news-cover-loading-text">加载中...</span>
				</div>
				<!-- 图片 -->
				<img
					v-if="!imageErrors[index]"
					:src="getImageUrl(item.封面)"
					:alt="item.标题 || 'B站动态'"
					:class="[
						'news-cover',
						getImageFitClass(index),
						{ 'news-cover-loaded': imageLoadingStates[index] === 'loaded' },
					]"
					:loading="index < 3 ? 'eager' : 'lazy'"
					referrerpolicy="no-referrer"
					crossorigin="anonymous"
					@error="handleImageError(index)"
					@load="handleImageLoad($event, index)"
				/>
				<!-- 图片加载失败时的占位符 -->
				<div v-if="imageErrors[index]" class="news-cover-placeholder">
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
							<path
								d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
							></path>
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
