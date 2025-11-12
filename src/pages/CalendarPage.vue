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
									<svg
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V16C17 17.1046 16.1046 18 15 18H5C3.89543 18 3 17.1046 3 16V6C3 4.89543 3.89543 4 5 4Z"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
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
									<svg
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M10 6V10L13 13"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
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
									<svg
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M8 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H14C15.1046 16 16 15.1046 16 14V6C16 4.89543 15.1046 4 14 4H12M8 4C8 5.10457 8.89543 6 10 6H10C11.1046 6 12 5.10457 12 4M8 4C8 2.89543 8.89543 2 10 2H10C11.1046 2 12 2.89543 12 4M8 8H12M8 12H12"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
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
									<svg
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M6 8L8 10L12 6"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
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
