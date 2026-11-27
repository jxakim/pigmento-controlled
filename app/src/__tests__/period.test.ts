import { describe, expect, it } from "vitest"
import { formatIsoDate, parseIsoDate } from "../lib/calendar/logic/dates"
import { getParent, getRange, isLevel, getKey, type Level, move, type Period } from "../lib/calendar/logic/period"

function period(level: Level, date: string): Period {
	return { level, date: parseIsoDate(date) }
}

function range(p: Period): string {
	const { start, end } = getRange(p)
	return `${formatIsoDate(start)} ${formatIsoDate(end)}`
}

describe("isLevel", () => {
	it.each(["year", "month", "week", "day"])("accepts %s", (value) => {
		expect(isLevel(value)).toBe(true)
	})

	it.each(["pigmento", "Day", "", null])("rejects %s", (value) => {
		expect(isLevel(value)).toBe(false)
	})
})

describe("getRange", () => {
	it.each([
		["a day", period("day", "2026-11-05"), "2026-11-05 2026-11-06"],
		["a week from a Thursday", period("week", "2026-11-05"), "2026-11-02 2026-11-09"],
		["a week from a Monday", period("week", "2026-11-02"), "2026-11-02 2026-11-09"],
		["a week from a Sunday", period("week", "2026-11-08"), "2026-11-02 2026-11-09"],
		["the week with the clock change", period("week", "2026-10-25"), "2026-10-19 2026-10-26"],
		["a week that crosses the new year", period("week", "2027-01-01"), "2026-12-28 2027-01-04"],
		["a month", period("month", "2026-11-17"), "2026-11-01 2026-12-01"],
		["December", period("month", "2026-12-17"), "2026-12-01 2027-01-01"],
		["a year", period("year", "2026-06-15"), "2026-01-01 2027-01-01"],
	])("%s", (_, p, expected) => {
		expect(range(p)).toBe(expected)
	})
})

describe("move", () => {
	it.each([
		["a day forward across a month", period("day", "2026-11-30"), 1, "2026-12-01"],
		["a day back across the clock change", period("day", "2026-10-26"), -1, "2026-10-25"],
		["a week forward across the new year", period("week", "2026-12-28"), 1, "2027-01-04"],
		["a week back", period("week", "2026-11-05"), -1, "2026-10-29"],
		["a month from 31 January", period("month", "2027-01-31"), 1, "2027-02-28"],
		["a month back from 31 March", period("month", "2027-03-31"), -1, "2027-02-28"],
		["a month forward across the new year", period("month", "2026-12-15"), 1, "2027-01-15"],
		["a year from 29 February", period("year", "2028-02-29"), 1, "2029-02-28"],
		["zero steps", period("day", "2026-11-05"), 0, "2026-11-05"],
	])("%s", (_, p, amount, expected) => {
		const moved = move(p, amount)
		expect(moved.level).toBe(p.level)
		expect(formatIsoDate(moved.date)).toBe(expected)
	})
})

describe("getParent", () => {
	it.each([
		["day", "week"],
		["week", "month"],
		["month", "year"],
	] as const)("the parent of %s is %s, on the same date", (level, parent) => {
		const p = period(level, "2026-11-30")
		expect(getParent(p)).toEqual({ level: parent, date: p.date })
	})

	it("a year has no parent", () => {
		expect(getParent(period("year", "2026-11-30"))).toBeUndefined()
	})
})

describe("getKey", () => {
	it.each([
		[period("year", "2026-11-05"), "2026"],
		[period("month", "2026-11-05"), "2026-11"],
		[period("week", "2026-11-05"), "2026-W45"],
		[period("week", "2027-01-01"), "2026-W53"],
		[period("day", "2026-11-05"), "2026-11-05"],
	])("%o → %s", (p, key) => {
		expect(getKey(p)).toBe(key)
	})

	it("gives the same key for every day in a week", () => {
		expect(getKey(period("week", "2026-11-23"))).toBe(getKey(period("week", "2026-11-29")))
	})
})