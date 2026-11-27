import { type CalendarItem, itemsInRange, splitByDay } from "./items"
import type { Range } from "./period"

export type PlacedItem = {
    item: CalendarItem
    column: number
    columns: number
}

export type Hours = {
    start: number
    end: number
} // whole hours, e.g. 7 and 19

const defaultHours: Hours = {
    start: 7,
    end: 19
}

export function startMinutes(segment: CalendarItem): number {
	const [hour, minute] = segment.start.slice(11, 16).split(":").map(Number)
	return hour * 60 + minute
}

export function endMinutes(segment: CalendarItem): number {
	// After splitByDay, an end on a later date can only mean midnight
	if (segment.end.slice(0, 10) > segment.start.slice(0, 10)) {
        return 24 * 60
    }

	const [hour, minute] = segment.end.slice(11, 16).split(":").map(Number)
    
	return hour * 60 + minute
}

export function getVisibleHours(items: CalendarItem[], range: Range): Hours {
	let { start, end } = defaultHours

	for (const segment of itemsInRange(items.flatMap(splitByDay), range)) {
		start = Math.min(start, Math.floor(startMinutes(segment) / 60))
		end = Math.max(end, Math.ceil(endMinutes(segment) / 60))
	}

	return { start, end }
}

export function toPercent(minutes: number, hours: Hours): number {
	const total = (hours.end - hours.start) * 60
	return ((minutes - hours.start * 60) / total) * 100
}

export function layoutOverlaps(items: CalendarItem[]): PlacedItem[] {
	const sorted = [...items].sort((a, b) =>
		a.start.localeCompare(b.start) || b.end.localeCompare(a.end)
	)
	const placed: PlacedItem[] = []
	let group: PlacedItem[] = []
	let columnEnds: string[] = [] // when the last item in each column ends
	let groupEnd = ""

	function closeGroup() {
		for (const p of group) {
			p.columns = columnEnds.length
		}

		placed.push(...group)
		group = []
		columnEnds = []
	}

	for (const item of sorted) {
		if (group.length > 0 && item.start >= groupEnd) {
			closeGroup()
		}

		let column = columnEnds.findIndex((end) => end <= item.start)
		if (column === -1) {
			column = columnEnds.length
		}
		columnEnds[column] = item.end

		if (group.length === 0 || item.end > groupEnd) {
			groupEnd = item.end
		}
		group.push({ item, column, columns: 0 })
	}
	closeGroup()

	return placed
}