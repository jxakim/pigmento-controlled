import { formatIsoDate, getIsoWeekNumber } from "./dates"

export type Level = "year" | "month" | "week" | "day"
export type Period = { level: Level; date: Date }
export type Range = { start: Date; end: Date }

export function getRange({ level, date }: Period): Range {
	const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

	switch (level) {
		case "year":
            return {
                start: new Date(year, 0, 1),
                end: new Date(year + 1, 0, 1)
            }

		case "month":
            return {
                start: new Date(year, month, 1),
                end: new Date(year, month + 1, 1)
            }

		case "week":
            {
			    const monday = day - ((date.getDay() + 6) % 7)
			    return {
                    start: new Date(year, month, monday),
                    end: new Date(year, month, monday + 7)
                }
		    }

		case "day":
            return {
                start: new Date(year, month, day),
                end: new Date(year, month, day + 1)
            }
	}
}

function addMonths(date: Date, amount: number): Date {
	const year = date.getFullYear()
    const month = date.getMonth() + amount
	const lastDay = new Date(year, month + 1, 0).getDate()

	return new Date(year, month, Math.min(date.getDate(), lastDay))
}

export function move(period: Period, amount: number): Period {
	const { level, date } = period
	const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

	const next = {
		year: () => addMonths(date, 12 * amount),
		month: () => addMonths(date, amount),
		week: () => new Date(year, month, day + 7 * amount),
		day: () => new Date(year, month, day + amount),
	}[level]()

	return { level, date: next }
}

const parentLevel: Record<Level, Level | undefined> = {
	day: "week",
    week: "month",
    month: "year",
    year: undefined,
}

export function getParent(period: Period): Period | undefined {
	const level = parentLevel[period.level]
	return level && { level, date: period.date }
}