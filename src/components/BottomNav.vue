<script setup lang="ts">
import { useBottomNav } from '../ts/useBottomNav'

const { leftItems, rightItems, homeIcon, activeKey, setActive } = useBottomNav()
</script>

<template>
	<nav class="bottom-nav" aria-label="主导航">
		<button v-for="item in leftItems" :key="item.key" type="button" class="nav-item">
			<img :src="item.icon" class="nav-item__icon" :alt="item.alt ?? item.label" />
			<span class="sr-only">{{ item.label }}</span>
		</button>

		<button
			type="button"
			class="nav-item nav-item--home"
			:aria-current="activeKey === 'home' ? 'page' : undefined"
			@click="setActive('home')"
		>
			<img :src="homeIcon" class="nav-item__icon nav-item__icon--home" alt="主页" />
			<span class="sr-only">主页</span>
		</button>

		<button v-for="item in rightItems" :key="item.key" type="button" class="nav-item">
			<img :src="item.icon" class="nav-item__icon" :alt="item.alt ?? item.label" />
			<span class="sr-only">{{ item.label }}</span>
		</button>
	</nav>
</template>

<style scoped src="../styles/components/bottom-nav.css"></style>
