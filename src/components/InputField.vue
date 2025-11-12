<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
	defineProps<{
		modelValue?: string
		label?: string
		placeholder?: string
		type?: string
		disabled?: boolean
		readonly?: boolean
		autocomplete?: string
		hint?: string
		error?: string
		required?: boolean
		id?: string
	}>(),
	{
		modelValue: '',
		type: 'text',
		autocomplete: 'off',
	},
)

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'blur', event: FocusEvent): void
	(e: 'focus', event: FocusEvent): void
}>()

const inputId = computed(() => props.id ?? `input-${Math.random().toString(36).slice(2, 10)}`)

const hasValue = computed(() => props.modelValue?.length)

const hasError = computed(() => Boolean(props.error))

const onInput = (event: Event) => {
	const target = event.target as HTMLInputElement
	emit('update:modelValue', target.value)
}

const onBlur = (event: FocusEvent) => emit('blur', event)
const onFocus = (event: FocusEvent) => emit('focus', event)
</script>

<template>
	<div
		class="input-field"
		:class="{
			'is-disabled': disabled,
			'is-readonly': readonly,
			'is-filled': hasValue,
			'is-error': hasError,
		}"
	>
		<label v-if="label" :for="inputId" class="input-field__label">
			{{ label }}
			<span v-if="required" aria-hidden="true" class="input-field__required">*</span>
		</label>

		<div class="input-field__control">
			<input
				:id="inputId"
				class="input-field__input"
				:type="type"
				:value="modelValue"
				:placeholder="placeholder"
				:disabled="disabled"
				:readonly="readonly"
				:required="required"
				:autocomplete="autocomplete"
				@input="onInput"
				@focus="onFocus"
				@blur="onBlur"
			/>
		</div>

		<p v-if="error" class="input-field__message input-field__message--error" role="alert">
			{{ error }}
		</p>
		<p v-else-if="hint" class="input-field__message input-field__message--hint">
			{{ hint }}
		</p>
	</div>
</template>

<style scoped src="../styles/components/input.css"></style>
