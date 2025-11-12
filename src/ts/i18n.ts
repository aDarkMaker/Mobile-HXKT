import { computed, ref, watchEffect } from 'vue'
import zhCN from '../i18n/zh-CN.json'
import enUS from '../i18n/en-US.json'

export type Locale = 'zh-CN' | 'en-US'
type MessageTree = typeof zhCN | typeof enUS

const STORAGE_KEY = 'hxkt.locale'
const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US']
const FALLBACK_LOCALE: Locale = 'zh-CN'

const messages: Record<Locale, MessageTree> = {
	'zh-CN': zhCN,
	'en-US': enUS,
}

const locale = ref<Locale>(resolveInitialLocale())

function resolveInitialLocale(): Locale {
	if (typeof window === 'undefined') {
		return FALLBACK_LOCALE
	}

	const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
	if (stored && SUPPORTED_LOCALES.includes(stored)) {
		return stored
	}

	const systemLocale = window.navigator.language
	const matched = SUPPORTED_LOCALES.find((item) =>
		systemLocale.toLowerCase().startsWith(item.toLowerCase()),
	)

	return matched ?? FALLBACK_LOCALE
}

watchEffect(() => {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY, locale.value)
	document.documentElement.setAttribute('lang', locale.value)
})

function lookup(path: string, currentMessages: MessageTree): string {
	const segments = path.split('.')
	let node: unknown = currentMessages

	for (const segment of segments) {
		if (typeof node !== 'object' || node === null || !(segment in node)) {
			return path
		}
		node = (node as Record<string, unknown>)[segment]
	}

	return typeof node === 'string' ? node : path
}

export function useI18n() {
	const t = (path: string) => lookup(path, messages[locale.value])

	const availableLocales = computed(() => SUPPORTED_LOCALES.slice())

	const setLocale = (next: Locale | string) => {
		if (SUPPORTED_LOCALES.includes(next as Locale)) {
			locale.value = next as Locale
		}
	}

	return {
		locale,
		t,
		setLocale,
		availableLocales,
	}
}
