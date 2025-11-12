<script setup lang="ts">
import { useBottomNav } from '../ts/useBottomNav'
import { useI18n } from '../ts/i18n'

const { leftItems, rightItems, homeIcon, homeLabelKey, activeKey, setActive } = useBottomNav()
const { t } = useI18n()
</script>

<template>
	<nav class="bottom-nav" :aria-label="t('nav.home')">
		<button
			v-for="item in leftItems"
			:key="item.key"
			type="button"
			class="nav-item"
			:class="{ 'is-active': activeKey === item.key }"
			:aria-current="activeKey === item.key ? 'page' : undefined"
			:aria-label="t(item.labelKey)"
			@click="setActive(item.key)"
		>
			<img :src="item.icon" class="nav-item__icon" :alt="t(item.labelKey)" />
			<span class="sr-only">{{ t(item.labelKey) }}</span>
		</button>

		<button
			type="button"
			class="nav-item"
			:class="{ 'is-active': activeKey === 'home' }"
			:aria-current="activeKey === 'home' ? 'page' : undefined"
			:aria-label="t(homeLabelKey)"
			@click="setActive('home')"
		>
			<img :src="homeIcon" class="nav-item__icon" :alt="t(homeLabelKey)" />
			<span class="sr-only">{{ t(homeLabelKey) }}</span>
		</button>

		<button
			v-for="item in rightItems"
			:key="item.key"
			type="button"
			class="nav-item"
			:class="{ 'is-active': activeKey === item.key }"
			:aria-current="activeKey === item.key ? 'page' : undefined"
			:aria-label="t(item.labelKey)"
			@click="setActive(item.key)"
		>
			<img :src="item.icon" class="nav-item__icon" :alt="t(item.labelKey)" />
			<span class="sr-only">{{ t(item.labelKey) }}</span>
		</button>
	</nav>
</template>

<style scoped src="../styles/components/bottom-nav.css"></style>
<style scoped src="../styles/theme.css"></style>
