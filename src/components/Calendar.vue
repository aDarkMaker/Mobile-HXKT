<script setup lang="ts">
import { computed, ref, defineOptions } from 'vue'
import {
	type CalendarEvent,
	isToday,
	isSameDate,
	getEventClass,
	generateWeekDays,
	getWeekStartDate,
	formatDateHeader,
	getWeekNumber,
	getEventsForTimeSlot,
	TIME_SLOTS,
	getWeekDayLabel,
} from '../ts/calendar'
import { useI18n } from '../ts/i18n'

defineOptions({
	name: 'AppCalendar',
})

const { t } = useI18n()

const props = defineProps<{
	events?: CalendarEvent[]
}>()

const emit = defineEmits<{
	(eventName: 'date-select', date: Date): void
	(eventName: 'event-click', calendarEvent: CalendarEvent): void
}>()

const currentWeekStart = ref(getWeekStartDate(new Date()))
const selectedDate = ref<Date | null>(null)

const weekDays = computed(() => generateWeekDays(currentWeekStart.value))
const headerDate = computed(() => currentWeekStart.value)
const weekNum = computed(() => getWeekNumber(currentWeekStart.value))

const prevWeek = () => {
	const newDate = new Date(currentWeekStart.value)
	newDate.setDate(newDate.getDate() - 7)
	currentWeekStart.value = getWeekStartDate(newDate)
}

const nextWeek = () => {
	const newDate = new Date(currentWeekStart.value)
	newDate.setDate(newDate.getDate() + 7)
	currentWeekStart.value = getWeekStartDate(newDate)
}

const goToToday = () => {
	currentWeekStart.value = getWeekStartDate(new Date())
	selectedDate.value = null
}

const selectDate = (date: Date) => {
	selectedDate.value = date
	emit('date-select', date)
}

const clickEvent = (calendarEvent: CalendarEvent, e: Event) => {
	e.stopPropagation()
	emit('event-click', calendarEvent)
}
</script>

<template>
	<div class="calendar calendar-week-schedule">
		<div class="calendar-header">
			<button class="calendar-nav-btn" @click="prevWeek" :aria-label="t('calendar.prevWeek')">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path
						d="M12.5 15L7.5 10L12.5 5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button class="calendar-today-btn" @click="goToToday">{{ t('calendar.today') }}</button>
			<button class="calendar-nav-btn" @click="nextWeek" :aria-label="t('calendar.nextWeek')">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path
						d="M7.5 15L12.5 10L7.5 5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>

		<div class="calendar-schedule-table">
			<!-- 左上角：日期和周数 -->
			<div class="schedule-corner">
				<div class="corner-date">{{ formatDateHeader(headerDate) }}</div>
				<div class="corner-week">
					{{ t('calendar.weekNumber').replace('{week}', String(weekNum)) }}
				</div>
			</div>

			<!-- 横轴：周几+日期 -->
			<div
				v-for="day in weekDays"
				:key="day.getTime()"
				class="schedule-day-header"
				:class="{
					today: isToday(day),
					selected: selectedDate && isSameDate(selectedDate, day),
				}"
				@click="selectDate(day)"
			>
				<div class="day-week">{{ getWeekDayLabel(day.getDay(), t) }}</div>
				<div class="day-date">{{ day.getDate() }}</div>
			</div>

			<!-- 时间轴和事件网格 -->
			<template v-for="(timeSlot, timeIndex) in TIME_SLOTS" :key="timeIndex">
				<!-- 时间标签 -->
				<div class="schedule-time-label">
					<div class="time-start">{{ timeSlot.start }}</div>
					<div class="time-end">{{ timeSlot.end }}</div>
				</div>

				<!-- 每天的时间段单元格 -->
				<div
					v-for="day in weekDays"
					:key="`${day.getTime()}-${timeIndex}`"
					class="schedule-cell"
					:class="{
						today: isToday(day),
						selected: selectedDate && isSameDate(selectedDate, day),
					}"
					@click="selectDate(day)"
				>
					<div
						v-for="event in getEventsForTimeSlot(day, timeSlot, props.events)"
						:key="event.id"
						:class="getEventClass(event)"
						class="schedule-event"
						@click="clickEvent(event, $event)"
					>
						{{ event.title }}
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<style scoped src="../styles/components/calendar.css"></style>
