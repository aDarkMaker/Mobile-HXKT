<script setup lang="ts">
import { ref } from 'vue'
import Calendar from '../components/Calendar.vue'
import type { CalendarEvent } from '../ts/calendarPage'
import {
	formatDate,
	formatTime,
	getEventTypeText,
	getStatusText,
	getStatusClass,
	createSampleEvents,
} from '../ts/calendarPage'
import { useI18n } from '../ts/i18n'

const { t } = useI18n()

const calendarIcon = new URL('../assets/img/calendar2.png', import.meta.url).href
const timeIcon = new URL('../assets/img/time.png', import.meta.url).href
const describeIcon = new URL('../assets/img/discribe.png', import.meta.url).href
const goorpassIcon = new URL('../assets/img/goorpass.png', import.meta.url).href

const events = ref<CalendarEvent[]>(createSampleEvents())

const selectedEvent = ref<CalendarEvent | null>(null)
const showEventModal = ref(false)

const handleDateSelect = (date: Date) => {
	console.log('Selected date:', date)
}

const handleEventClick = (event: CalendarEvent) => {
	selectedEvent.value = event
	showEventModal.value = true
}

const closeEventModal = () => {
	showEventModal.value = false
	selectedEvent.value = null
}
</script>

<template>
	<section class="calendar-page">
		<h1 class="calendar-page__title">{{ t('calendar.title') }}</h1>

		<Calendar
			:events="events"
			@date-select="handleDateSelect"
			@event-click="handleEventClick"
		/>

		<!-- 事件详情模态框 -->
		<Transition name="modal-fade">
			<div
				v-if="showEventModal && selectedEvent"
				class="event-modal"
				@click.self="closeEventModal"
			>
				<div class="event-modal-content">
					<div class="event-modal-header">
						<div class="event-header-info">
							<h3 class="event-modal-title">{{ selectedEvent.title }}</h3>
							<div class="event-type-badge" :class="selectedEvent.type">
								{{ getEventTypeText(selectedEvent.type) }}
							</div>
						</div>
						<button
							class="close-btn"
							@click="closeEventModal"
							:aria-label="t('calendar.eventModal.close')"
						>
							&times;
						</button>
					</div>
					<div class="event-modal-body">
						<div class="event-details">
							<div class="event-detail-item">
								<div class="detail-icon-wrapper">
									<img :src="calendarIcon" alt="日期" class="detail-icon" />
								</div>
								<div class="event-detail-content">
									<div class="event-detail-label">
										{{ t('calendar.eventModal.date') }}
									</div>
									<div class="event-detail-value">
										{{ formatDate(selectedEvent.date) }}
									</div>
								</div>
							</div>
							<div class="event-detail-item">
								<div class="detail-icon-wrapper">
									<img :src="timeIcon" alt="时间" class="detail-icon" />
								</div>
								<div class="event-detail-content">
									<div class="event-detail-label">
										{{ t('calendar.eventModal.time') }}
									</div>
									<div class="event-detail-value">
										{{ formatTime(selectedEvent.date) }}
									</div>
								</div>
							</div>
							<div v-if="selectedEvent.description" class="event-detail-item">
								<div class="detail-icon-wrapper">
									<img :src="describeIcon" alt="描述" class="detail-icon" />
								</div>
								<div class="event-detail-content">
									<div class="event-detail-label">
										{{ t('calendar.eventModal.description') }}
									</div>
									<div class="event-detail-value">
										{{ selectedEvent.description }}
									</div>
								</div>
							</div>
							<div
								v-if="selectedEvent.attendance"
								class="event-detail-item status-item"
							>
								<div class="detail-icon-wrapper">
									<img :src="goorpassIcon" alt="状态" class="detail-icon" />
								</div>
								<div class="event-detail-content">
									<div class="event-detail-label">
										{{ t('calendar.eventModal.status') }}
									</div>
									<div
										class="event-detail-value status-value"
										:class="getStatusClass(selectedEvent.attendance)"
									>
										{{ getStatusText(selectedEvent.attendance) }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</section>
</template>

<style scoped src="../styles/pages/calendar.css"></style>
