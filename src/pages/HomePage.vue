<script setup lang="ts">
import AnnouncementBoard from '../components/AnnouncementBoard.vue'
import LatestNews from '../components/LatestNews.vue'
import type { Announcement, BilibiliDynamic } from '../ts/home'
import { useI18n } from '../ts/i18n'

const { t } = useI18n()

const props = defineProps<{
	announcements?: Announcement[]
	news?: BilibiliDynamic[]
}>()

const handleAnnouncementClick = (announcement: Announcement) => {
	console.log('Announcement clicked:', announcement)
}

const handleNewsClick = (newsItem: BilibiliDynamic) => {
	if (newsItem.link) {
		window.open(newsItem.link, '_blank')
	} else {
		console.log('News clicked:', newsItem)
	}
}
</script>

<template>
	<section class="home-page">
		<h1 class="home-page__title">{{ t('home.title') }}</h1>

		<!-- 公告栏 -->
		<div class="home-section">
			<h2 class="home-section__title">{{ t('home.announcements.title') }}</h2>
			<AnnouncementBoard
				:announcements="props.announcements"
				@announcement-click="handleAnnouncementClick"
			/>
		</div>

		<!-- 最新资讯 -->
		<div class="home-section">
			<h2 class="home-section__title">{{ t('home.news.title') }}</h2>
			<div v-if="!props.news || props.news.length === 0" class="home-empty">
				{{ t('home.news.empty') }}
			</div>
			<LatestNews v-else :news="props.news" @news-click="handleNewsClick" />
		</div>
	</section>
</template>

<style scoped src="../styles/pages/home.css"></style>
