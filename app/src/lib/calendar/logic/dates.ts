export function parseIsoDate(isoDate: string): Date {
	const [year, month, day] = isoDate.split("-").map(Number)

	return new Date(year, month - 1, day)
}

export function formatIsoDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")

	return `${date.getFullYear()}-${month}-${day}`
}

export function isSameDay(first: Date | undefined, second: Date): boolean {
	return first?.toDateString() === second.toDateString()
}

export function getDaysInRange(start: Date, end: Date): Date[] {
	const days: Date[] = []
	const current = new Date(start.getFullYear(), start.getMonth(), start.getDate())

	while (current < end) {
		days.push(new Date(current))
		current.setDate(current.getDate() + 1)
	}

	return days
}

export function getMonthGridDays(year: number, monthIndex: number): (Date | undefined)[] {
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
	const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7

	return Array.from({ length: 42 }, (_, cell) => {
		const dayOfMonth = cell - leadingBlanks + 1
		return dayOfMonth >= 1 && dayOfMonth <= daysInMonth ? new Date(year, monthIndex, dayOfMonth) : undefined
	})
}

export function getIsoWeekNumber(date: Date): number {
	// A week belongs to the year its Thursday falls in, so jump to this week's Thursday
	const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	thursday.setDate(thursday.getDate() + 3 - ((thursday.getDay() + 6) % 7))

	const startOfYear = new Date(thursday.getFullYear(), 0, 1)
	const dayOfYear = Math.round((thursday.getTime() - startOfYear.getTime()) / 86_400_000) + 1
	
	return Math.ceil(dayOfYear / 7)
}
