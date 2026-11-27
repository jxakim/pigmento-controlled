import { describe, expect, it } from "vitest"
import {
	formatIsoDate,
	getDaysInRange,
	getIsoWeekNumber,
	getMonthGridDays,
	isSameDay,
	parseIsoDate,
} from "../lib/calendar/logic/dates"

describe("parseIsoDate and formatIsoDate", () => {
	it("parses a date as local midnight", () => {
		const date = parseIsoDate("2026-11-05")
		expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 10, 5, 0])
	})

	it("pads month and day with zeros", () => {
		expect(formatIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05")
	})

	it("round-trips", () => {
		expect(formatIsoDate(parseIsoDate("2026-12-31"))).toBe("2026-12-31")
	})
})

describe("isSameDay", () => {
	it("ignores the time of day", () => {
		expect(isSameDay(new Date(2026, 10, 5, 8), new Date(2026, 10, 5, 23))).toBe(true)
	})

	it("is false for different days and for undefined", () => {
		expect(isSameDay(new Date(2026, 10, 5), new Date(2026, 10, 6))).toBe(false)
		expect(isSameDay(undefined, new Date(2026, 10, 5))).toBe(false)
	})
})

describe("getDaysInRange", () => {
	it("excludes the end, like every range in the calendar", () => {
		const days = getDaysInRange(new Date(2026, 10, 23), new Date(2026, 10, 30))
		expect(days.map(formatIsoDate)).toEqual([
			"2026-11-23",
			"2026-11-24",
			"2026-11-25",
			"2026-11-26",
			"2026-11-27",
			"2026-11-28",
			"2026-11-29",
		])
	})

	it("gives seven days for the week with the clock change (2026-10-25)", () => {
		const days = getDaysInRange(new Date(2026, 9, 19), new Date(2026, 9, 26))
		expect(days.map(formatIsoDate)).toEqual([
			"2026-10-19",
			"2026-10-20",
			"2026-10-21",
			"2026-10-22",
			"2026-10-23",
			"2026-10-24",
			"2026-10-25",
		])
	})

	it("is empty for an empty range", () => {
		expect(getDaysInRange(new Date(2026, 10, 5), new Date(2026, 10, 5))).toEqual([])
	})
})

describe("getMonthGridDays", () => {
	it("always has 42 cells", () => {
		expect(getMonthGridDays(2026, 10)).toHaveLength(42)
	})

	it("puts six blanks before a month that starts on a Sunday", () => {
		// 1 November 2026 is a Sunday
		const cells = getMonthGridDays(2026, 10)
		expect(cells.slice(0, 6)).toEqual([undefined, undefined, undefined, undefined, undefined, undefined])
		expect(formatIsoDate(cells[6] as Date)).toBe("2026-11-01")
	})

	it("has no blanks before a month that starts on a Monday", () => {
		// 1 June 2026 is a Monday
		expect(formatIsoDate(getMonthGridDays(2026, 5)[0] as Date)).toBe("2026-06-01")
	})
})

describe("getIsoWeekNumber", () => {
	it.each([
		["2026-11-24", 48],
		["2026-12-28", 53], // the week that crosses the new year
		["2027-01-01", 53], // belongs to 2026, because that week's Thursday is 31 Dec
		["2027-01-04", 1], // 4 January is always in week 1
		["2024-12-30", 1], // belongs to 2025
		["2026-10-25", 43], // the clock change, a Sunday
	])("%s is week %i", (date, week) => {
		expect(getIsoWeekNumber(parseIsoDate(date))).toBe(week)
	})
})
