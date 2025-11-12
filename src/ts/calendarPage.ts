import type { CalendarEvent } from './calendar'
import { useI18n } from './i18n'

export type { CalendarEvent }

export function formatDate(date: Date | string): string {
	const d = new Date(date)
	const { locale } = useI18n()
	const localeCode = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
	return d.toLocaleDateString(localeCode, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'long',
	})
}

export function formatTime(date: Date | string): string {
	const d = new Date(date)
	const { locale } = useI18n()
	const localeCode = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
	return d.toLocaleTimeString(localeCode, {
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function getEventTypeText(type: string): string {
	const { t } = useI18n()
	return t(`calendar.eventTypes.${type}`) || t('calendar.eventTypes.event')
}

export function getStatusText(attendance?: string): string {
	if (!attendance) return ''
	const { t } = useI18n()
	return t(`calendar.eventStatus.${attendance}`) || ''
}

export function getStatusClass(attendance?: string): string {
	if (!attendance) return ''
	return `status-${attendance}`
}

export function createSampleEvents(): CalendarEvent[] {
	return [
		{
			id: '1',
			title: '团队例会',
			type: 'meeting',
			date: new Date(),
			description: '每周例会',
			attendance: 'pending',
		},
	]
}
