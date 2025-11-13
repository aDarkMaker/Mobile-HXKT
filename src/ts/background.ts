import { ref, watch } from 'vue'

const STORAGE_KEY = 'hxkt.background.image'

const backgroundImage = ref<string | null>(resolveInitialBackground())

function resolveInitialBackground(): string | null {
	if (typeof window === 'undefined') return null
	return window.localStorage.getItem(STORAGE_KEY)
}

function applyBackgroundImage(image: string | null) {
	if (typeof document === 'undefined') return
	const root = document.documentElement
	if (image) {
		root.style.setProperty('--app-background-image', `url(${image})`)
		root.classList.add('has-custom-background')
	} else {
		root.style.setProperty('--app-background-image', 'none')
		root.classList.remove('has-custom-background')
	}
}

watch(
	backgroundImage,
	(value) => {
		if (typeof window !== 'undefined') {
			if (value) {
				window.localStorage.setItem(STORAGE_KEY, value)
			} else {
				window.localStorage.removeItem(STORAGE_KEY)
			}
		}

		applyBackgroundImage(value)
	},
	{ immediate: true },
)

export function useBackgroundImage() {
	const setBackgroundImage = (image: string | null) => {
		backgroundImage.value = image
	}

	const clearBackgroundImage = () => {
		setBackgroundImage(null)
	}

	return {
		backgroundImage,
		setBackgroundImage,
		clearBackgroundImage,
	}
}

