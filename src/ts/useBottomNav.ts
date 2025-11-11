import { readonly, ref } from 'vue'

export interface NavItem {
	key: NavKey
	icon: string
	label: string
	alt?: string
}

export type NavKey = 'files' | 'calendar' | 'home' | 'tasks' | 'settings'

const leftItems: ReadonlyArray<NavItem> = [
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

const rightItems: ReadonlyArray<NavItem> = [
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

const activeKeyState = ref<NavKey>('home')

const setActive = (key: NavKey) => {
	activeKeyState.value = key
}

export function useBottomNav() {
	const activeKey = readonly(activeKeyState)

	return {
		leftItems,
		rightItems,
		homeIcon,
		activeKey,
		setActive,
	}
}
