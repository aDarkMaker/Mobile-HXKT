export interface CalendarEvent {
	id: string
	title: string
	type: 'meeting' | 'task' | 'deadline' | 'event'
	date: Date | string
	description?: string
	duration?: number
	attendance?: 'pending' | 'confirmed' | 'absent'
}

export function isToday(date: Date): boolean {
	const today = new Date()
	return (
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	)
}

export function isSameDate(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	)
}

export function getEventsForDate(date: Date, events?: CalendarEvent[]): CalendarEvent[] {
	if (!events) return []
	return events.filter((event) => {
		const eventDate = new Date(event.date)
		return isSameDate(eventDate, date)
	})
}

export function getEventClass(event: CalendarEvent): string {
	const classes = ['calendar-event', event.type]
	if (event.type === 'meeting' && event.attendance) {
		classes.push(`meeting-${event.attendance}`)
	}
	return classes.join(' ')
}

export interface TimeSlot {
	start: string
	end: string
	label: string
}

export const TIME_SLOTS: TimeSlot[] = [
	{ start: '08:00', end: '08:45', label: '8:00-8:45' },
	{ start: '08:55', end: '09:40', label: '8:55-9:40' },
	{ start: '10:10', end: '10:55', label: '10:10-10:55' },
	{ start: '11:05', end: '11:50', label: '11:05-11:50' },
	{ start: '14:30', end: '15:15', label: '14:30-15:15' },
	{ start: '15:20', end: '16:05', label: '15:20-16:05' },
	{ start: '16:25', end: '17:10', label: '16:25-17:10' },
	{ start: '17:15', end: '18:00', label: '17:15-18:00' },
	{ start: '19:00', end: '19:45', label: '19:00-19:45' },
	{ start: '19:50', end: '20:35', label: '19:50-20:35' },
	{ start: '20:45', end: '21:30', label: '20:45-21:30' },
	{ start: '21:35', end: '22:20', label: '21:35-22:20' },
]

export function generateWeekDays(startDate: Date): Date[] {
	const days: Date[] = []
	const current = new Date(startDate)

	// 生成一周的日期（周一到周日）
	for (let day = 0; day < 7; day++) {
		days.push(new Date(current))
		current.setDate(current.getDate() + 1)
	}

	return days
}

export function getWeekStartDate(date: Date): Date {
	const d = new Date(date)
	const day = d.getDay() // 0 = 周日, 1 = 周一, ..., 6 = 周六
	// 回到本周一：如果 day === 0（周日），需要减去6天；否则减去 (day - 1) 天
	const diff = day === 0 ? -6 : -(day - 1)
	d.setDate(d.getDate() + diff)
	d.setHours(0, 0, 0, 0)
	return d
}

export function formatDateHeader(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	return `${year}.${month}`
}

export function getWeekNumber(date: Date): number {
	// 从9月1日计算为第一周
	const currentYear = date.getFullYear()
	const currentMonth = date.getMonth()

	// 确定学期开始的9月1日
	let semesterStart: Date
	if (currentMonth >= 8) {
		// 9月及之后，使用当年的9月1日
		semesterStart = new Date(currentYear, 8, 1) // 月份从0开始，8表示9月
	} else {
		// 9月之前，使用上一年的9月1日
		semesterStart = new Date(currentYear - 1, 8, 1)
	}

	// 将学期开始日期设置为当周的周一（作为第1周的开始）
	const weekStartDate = getWeekStartDate(semesterStart)

	// 将当前日期所在周的周一作为计算基准
	const currentWeekStart = getWeekStartDate(date)

	// 计算两个周一之间相差的毫秒数
	const diffMs = currentWeekStart.getTime() - weekStartDate.getTime()

	// 转换为周数（向上取整，确保至少为1）
	const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1

	return Math.max(1, diffWeeks)
}

export function getEventsForTimeSlot(
	date: Date,
	timeSlot: TimeSlot,
	events?: CalendarEvent[],
): CalendarEvent[] {
	if (!events) return []

	return events.filter((event) => {
		const eventDate = new Date(event.date)
		if (!isSameDate(eventDate, date)) return false

		const eventTime = eventDate.toTimeString().slice(0, 5) // HH:MM
		// 检查事件时间是否在时间段范围内
		return eventTime >= timeSlot.start && eventTime < timeSlot.end
	})
}

export function getMonthAtIntersection(date: Date): number {
	return date.getMonth() + 1
}

export const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

export function getWeekDayLabel(dayIndex: number, t: (key: string) => string): string {
	return t(`calendar.weekDays.${dayIndex}`)
}
