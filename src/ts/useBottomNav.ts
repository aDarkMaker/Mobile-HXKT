import { readonly, ref } from 'vue'

export interface NavItem {
	key: NavKey
	icon: string
	labelKey: string
}

export type NavKey = 'files' | 'calendar' | 'home' | 'tasks' | 'settings'

const leftItems: ReadonlyArray<NavItem> = [
	{
		key: 'files',
		icon: new URL('../assets/img/folder.png', import.meta.url).href,
		labelKey: 'nav.files',
	},
	{
		key: 'calendar',
		icon: new URL('../assets/img/calendar.png', import.meta.url).href,
		labelKey: 'nav.calendar',
	},
] as const

const rightItems: ReadonlyArray<NavItem> = [
	{
		key: 'tasks',
		icon: new URL('../assets/img/task.png', import.meta.url).href,
		labelKey: 'nav.tasks',
	},
	{
		key: 'settings',
		icon: new URL('../assets/img/setting.png', import.meta.url).href,
		labelKey: 'nav.settings',
	},
] as const

const homeIcon = new URL('../assets/img/home.png', import.meta.url).href
const homeLabelKey = 'nav.home'

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
		homeLabelKey,
		activeKey,
		setActive,
	}
}
