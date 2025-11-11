import { ref } from 'vue'

export interface NavItem {
	key: string
	icon: string
	label: string
	alt?: string
}

const leftItems: readonly NavItem[] = [
	{
		key: 'files',
		icon: new URL('../assets/img/folder.png', import.meta.url).href,
		label: '文件',
		alt: '文件',
	},
	{
		key: 'calendar',
		icon: new URL('../assets/img/calendar.png', import.meta.url).href,
		label: '日历',
		alt: '日历',
	},
] as const

const rightItems: readonly NavItem[] = [
	{
		key: 'tasks',
		icon: new URL('../assets/img/task.png', import.meta.url).href,
		label: '任务',
		alt: '任务',
	},
	{
		key: 'settings',
		icon: new URL('../assets/img/setting.png', import.meta.url).href,
		label: '设置',
		alt: '设置',
	},
] as const

const homeIcon = new URL('../assets/img/home.png', import.meta.url).href

export function useBottomNav() {
	const activeKey = ref<NavItem['key']>('home')

	const setActive = (key: NavItem['key']) => {
		activeKey.value = key
	}

	return {
		leftItems,
		rightItems,
		homeIcon,
		activeKey,
		setActive,
	}
}
