import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
	type ComputedRef,
	type Ref,
} from 'vue'

export interface DropDownOption {
	value: string | number
	label: string
	description?: string
	disabled?: boolean
	icon?: string
}

export interface DropDownProps {
	modelValue: DropDownOption['value'] | null
	options: DropDownOption[]
	placeholder?: string
	label?: string
	disabled?: boolean
}

export type DropDownEmitFn = {
	(e: 'update:modelValue', value: DropDownOption['value'] | null): void
	(e: 'change', option: DropDownOption | null): void
	(e: 'open'): void
	(e: 'close'): void
}

export interface UseDropDownReturn {
	triggerRef: Ref<HTMLButtonElement | null>
	listRef: Ref<HTMLUListElement | null>
	isOpen: Ref<boolean>
	focusIndex: Ref<number>
	selectedOption: ComputedRef<DropDownOption | null>
	placeholderText: ComputedRef<string>
	normalizedOptions: ComputedRef<
		Array<
			DropDownOption & {
				ariaId: string
			}
		>
	>
	toggleList: () => void
	selectOption: (option: DropDownOption | null) => void
	handleTriggerKeydown: (event: KeyboardEvent) => void
	handleListKeydown: (event: KeyboardEvent) => void
}

export function useDropDown(
	props: Readonly<DropDownProps>,
	emit: DropDownEmitFn,
): UseDropDownReturn {
	const triggerRef = ref<HTMLButtonElement | null>(null)
	const listRef = ref<HTMLUListElement | null>(null)
	const isOpen = ref(false)
	const focusIndex = ref(-1)

	const optionMap = computed(() => {
		const map = new Map<DropDownOption['value'], DropDownOption>()
		props.options.forEach((option) => map.set(option.value, option))
		return map
	})

	const selectedOption = computed(() => {
		if (props.modelValue == null) return null
		return optionMap.value.get(props.modelValue) ?? null
	})

	const normalizedOptions = computed(() =>
		props.options.map((option, index) => ({
			...option,
			ariaId: `dropdown-option-${option.value}-${index}`,
		})),
	)

	const placeholderText = computed(() => props.placeholder ?? '请选择')

	const openList = async () => {
		if (props.disabled || isOpen.value) return
		isOpen.value = true
		emit('open')

		await nextTick()
		if (selectedOption.value) {
			const index = normalizedOptions.value.findIndex(
				(option) => option.value === selectedOption.value?.value,
			)
			focusIndex.value = index
			scrollOptionIntoView(index)
		} else {
			focusIndex.value = -1
		}
	}

	const closeList = () => {
		if (!isOpen.value) return
		isOpen.value = false
		focusIndex.value = -1
		emit('close')
	}

	const toggleList = () => {
		if (isOpen.value) {
			closeList()
		} else {
			openList()
		}
	}

	const selectOption = (option: DropDownOption | null) => {
		if (option?.disabled) return
		const value = option?.value ?? null
		emit('update:modelValue', value)
		emit('change', option ?? null)
		closeList()
		triggerRef.value?.focus()
	}

	const focusNext = () => {
		if (!normalizedOptions.value.length) return
		let nextIndex = focusIndex.value
		do {
			nextIndex = (nextIndex + 1) % normalizedOptions.value.length
		} while (normalizedOptions.value[nextIndex]?.disabled && nextIndex !== focusIndex.value)

		focusIndex.value = nextIndex
		scrollOptionIntoView(nextIndex)
	}

	const focusPrevious = () => {
		if (!normalizedOptions.value.length) return
		let prevIndex = focusIndex.value
		do {
			prevIndex =
				(prevIndex - 1 + normalizedOptions.value.length) % normalizedOptions.value.length
		} while (normalizedOptions.value[prevIndex]?.disabled && prevIndex !== focusIndex.value)

		focusIndex.value = prevIndex
		scrollOptionIntoView(prevIndex)
	}

	const handleTriggerKeydown = (event: KeyboardEvent) => {
		if (props.disabled) return
		switch (event.key) {
			case 'Enter':
			case ' ':
			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault()
				openList()
				if (event.key === 'ArrowDown') {
					focusNext()
				}
				if (event.key === 'ArrowUp') {
					focusPrevious()
				}
				break
			default:
				break
		}
	}

	const handleListKeydown = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'Escape':
				event.preventDefault()
				closeList()
				triggerRef.value?.focus()
				break
			case 'ArrowDown':
				event.preventDefault()
				focusNext()
				break
			case 'ArrowUp':
				event.preventDefault()
				focusPrevious()
				break
			case 'Enter':
			case ' ':
				event.preventDefault()
				if (focusIndex.value >= 0) {
					const focused = normalizedOptions.value[focusIndex.value]
					if (focused) {
						selectOption(focused)
					}
				}
				break
			case 'Tab':
				closeList()
				break
			default:
				break
		}
	}

	const scrollOptionIntoView = (index: number) => {
		const list = listRef.value
		if (!list) return

		const optionEl = list.children.item(index) as HTMLElement | null
		if (!optionEl) return

		const optionTop = optionEl.offsetTop
		const optionBottom = optionTop + optionEl.offsetHeight
		const listScrollTop = list.scrollTop
		const listHeight = list.clientHeight

		if (optionTop < listScrollTop) {
			list.scrollTop = optionTop
		} else if (optionBottom > listScrollTop + listHeight) {
			list.scrollTop = optionBottom - listHeight
		}
	}

	const handleClickOutside = (event: MouseEvent) => {
		const trigger = triggerRef.value
		const list = listRef.value
		const target = event.target as Node | null
		if (!target) return

		if (trigger?.contains(target) || list?.contains(target)) {
			return
		}
		closeList()
	}

	watch(
		() => props.options,
		() => {
			if (!optionMap.value.has(props.modelValue as DropDownOption['value'])) {
				focusIndex.value = -1
			}
		},
		{ deep: true },
	)

	onMounted(() => {
		document.addEventListener('click', handleClickOutside)
	})

	onBeforeUnmount(() => {
		document.removeEventListener('click', handleClickOutside)
	})

	return {
		triggerRef,
		listRef,
		isOpen,
		focusIndex,
		selectedOption,
		placeholderText,
		normalizedOptions,
		toggleList,
		selectOption,
		handleTriggerKeydown,
		handleListKeydown,
	}
}
