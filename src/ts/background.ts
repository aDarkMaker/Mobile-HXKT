import { ref, watch } from 'vue'

const STORAGE_KEY_IMAGE = 'hxkt.background.image'
const STORAGE_KEY_POSITION = 'hxkt.background.position'

const backgroundImage = ref<string | null>(resolveInitialBackground())
const backgroundPosition = ref<string>(resolveInitialPosition())

function resolveInitialBackground(): string | null {
	if (typeof window === 'undefined') return null
	return window.localStorage.getItem(STORAGE_KEY_IMAGE)
}

function resolveInitialPosition(): string {
	if (typeof window === 'undefined') return 'center center'
	return window.localStorage.getItem(STORAGE_KEY_POSITION) || 'center center'
}

function applyBackgroundImage(image: string | null, position: string = 'center center') {
	if (typeof document === 'undefined') return
	const root = document.documentElement
	const body = document.body
	if (image) {
		const url = `url(${image})`
		root.style.setProperty('--app-background-image', url)
		body.style.backgroundImage = url
		body.style.backgroundRepeat = 'no-repeat'
		body.style.backgroundSize = 'cover'
		body.style.backgroundPosition = position
		body.style.backgroundAttachment = 'fixed'
		root.classList.add('has-custom-background')
	} else {
		root.style.setProperty('--app-background-image', 'none')
		body.style.removeProperty('background-image')
		body.style.removeProperty('background-repeat')
		body.style.removeProperty('background-size')
		body.style.removeProperty('background-position')
		body.style.removeProperty('background-attachment')
		root.classList.remove('has-custom-background')
	}
}

watch(
	[backgroundImage, backgroundPosition],
	([image, position]) => {
		if (typeof window !== 'undefined') {
			if (image) {
				window.localStorage.setItem(STORAGE_KEY_IMAGE, image)
				window.localStorage.setItem(STORAGE_KEY_POSITION, position)
			} else {
				window.localStorage.removeItem(STORAGE_KEY_IMAGE)
				window.localStorage.removeItem(STORAGE_KEY_POSITION)
			}
		}

		applyBackgroundImage(image, position)
	},
	{ immediate: true },
)

export function useBackgroundImage() {
	const setBackgroundImage = (image: string | null) => {
		backgroundImage.value = image
	}

	const setBackgroundPosition = (position: string) => {
		backgroundPosition.value = position
	}

	const clearBackgroundImage = () => {
		setBackgroundImage(null)
		setBackgroundPosition('center center')
	}

	return {
		backgroundImage,
		backgroundPosition,
		setBackgroundImage,
		setBackgroundPosition,
		clearBackgroundImage,
	}
}

