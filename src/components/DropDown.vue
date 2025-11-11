<script setup lang="ts">
import { useDropDown, type DropDownEmitFn, type DropDownProps } from '../ts/dropdown'

const props = defineProps<DropDownProps>()
const emit = defineEmits<DropDownEmitFn>()

const {
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
} = useDropDown(props, emit)
</script>

<template>
	<div
		class="dropdown"
		:class="{
			'dropdown--disabled': disabled,
			'dropdown--open': isOpen,
			'dropdown--has-value': !!selectedOption,
		}"
	>
		<div v-if="label" class="dropdown__label">{{ label }}</div>

		<button
			ref="triggerRef"
			type="button"
			class="dropdown__trigger"
			:disabled="disabled"
			aria-haspopup="listbox"
			:aria-expanded="isOpen"
			:aria-controls="`dropdown-list-${label ?? 'menu'}`"
			@click="toggleList"
			@keydown="handleTriggerKeydown"
		>
			<div class="dropdown__value">
				<template v-if="selectedOption">
					<img
						v-if="selectedOption.icon"
						class="dropdown__value-icon"
						:src="selectedOption.icon"
						alt=""
						aria-hidden="true"
					/>
					<div class="dropdown__value-text">
						<span class="dropdown__value-label">{{ selectedOption.label }}</span>
						<span v-if="selectedOption.description" class="dropdown__value-desc">{{
							selectedOption.description
						}}</span>
					</div>
				</template>
				<span v-else class="dropdown__placeholder">{{ placeholderText }}</span>
			</div>
			<span class="dropdown__chevron" aria-hidden="true"></span>
		</button>

		<transition name="dropdown-fade">
			<div v-if="isOpen" class="dropdown__popover">
				<ul
					ref="listRef"
					class="dropdown__options"
					role="listbox"
					:id="`dropdown-list-${label ?? 'menu'}`"
					:aria-activedescendant="
						focusIndex >= 0 ? normalizedOptions[focusIndex]?.ariaId : undefined
					"
					@keydown="handleListKeydown"
				>
					<li
						v-if="!normalizedOptions.length"
						class="dropdown__empty"
						role="presentation"
					>
						暂无可选项
					</li>
					<li
						v-for="(option, index) in normalizedOptions"
						:key="option.value"
						:id="option.ariaId"
						class="dropdown__option"
						:class="{
							'is-selected': selectedOption?.value === option.value,
							'is-focused': focusIndex === index,
							'is-disabled': option.disabled,
						}"
						role="option"
						:aria-selected="selectedOption?.value === option.value"
						:aria-disabled="option.disabled"
						@click="selectOption(option)"
						@mouseenter="focusIndex = index"
					>
						<img
							v-if="option.icon"
							class="dropdown__option-icon"
							:src="option.icon"
							alt=""
							aria-hidden="true"
						/>
						<div class="dropdown__option-content">
							<span class="dropdown__option-label">{{ option.label }}</span>
							<span v-if="option.description" class="dropdown__option-desc">{{
								option.description
							}}</span>
						</div>
						<span
							v-if="selectedOption?.value === option.value"
							class="dropdown__option-check"
							aria-hidden="true"
						></span>
					</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<style scoped src="../styles/components/dropdown.css"></style>
