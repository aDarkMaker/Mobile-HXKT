import { ref, watchEffect } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'hxkt.theme'

const mode = ref<ThemeMode>(resolveInitialMode())
const resolved = ref<ResolvedTheme>(resolveAppliedTheme(mode.value))

function resolveInitialMode(): ThemeMode {
	if (typeof window === 'undefined') return 'system'
	const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
	return stored ?? 'system'
}

function resolveAppliedTheme(nextMode: ThemeMode): ResolvedTheme {
	if (nextMode === 'light' || nextMode === 'dark') return nextMode
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme) {
	if (typeof document === 'undefined') return
	document.documentElement.dataset.theme = theme
}

function handleSystemChange(event: MediaQueryListEvent) {
	if (mode.value !== 'system') return
	resolved.value = event.matches ? 'dark' : 'light'
	applyTheme(resolved.value)
}

if (typeof window !== 'undefined') {
	const media = window.matchMedia('(prefers-color-scheme: dark)')
	if (media.addEventListener) {
		media.addEventListener('change', handleSystemChange)
	} else {
		// Safari
		media.addListener(handleSystemChange)
	}
}

watchEffect(() => {
	resolved.value = resolveAppliedTheme(mode.value)
	applyTheme(resolved.value)
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(STORAGE_KEY, mode.value)
	}
})

export function useTheme() {
	const setMode = (next: ThemeMode) => {
		mode.value = next
	}

	return {
		mode,
		resolvedTheme: resolved,
		setMode,
	}
}
