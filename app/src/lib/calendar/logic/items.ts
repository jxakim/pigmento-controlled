import { formatIsoDate, parseIsoDate } from "./dates"
import type { Range } from "./period"

export type CalendarItem = {
	id: string
	layer: string
	start: string // "2026-11-05T10:00", local time
	end: string // exclusive; "2026-11-06T00:00" means "until midnight"
	label: string
	kind: string // e.g. the appointment type, or "planned" / "worked"
}

function toTime(date: Date): string {
	return `${formatIsoDate(date)}T00:00`
}

export function itemsInRange(items: CalendarItem[], range: Range): CalendarItem[] {
	const rangeStart = toTime(range.start)
	const rangeEnd = toTime(range.end)

    if (rangeStart >= rangeEnd) return []

	return items.filter(
        (item) =>
            item.end > rangeStart
            && item.start < rangeEnd
    )
}

export function splitByDay(item: CalendarItem): CalendarItem[] {
	const segments: CalendarItem[] = []
	let start = item.start

	while (start < item.end) {
		const day = parseIsoDate(start.slice(0, 10))
		const nextMidnight = toTime(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1))
		
		// biome-ignore lint/complexity/useMathMinMax: comparing time strings, Math.min would return NaN
        const end = item.end < nextMidnight ? item.end : nextMidnight

		segments.push({ ...item, start, end })
		start = end
	}

	return segments
}