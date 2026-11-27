import { describe, expect, it } from "vitest"
import { type CalendarItem, itemsInRange, splitByDay } from "../lib/calendar/logic/items"

function item(start: string, end: string, id = "a"): CalendarItem {
	return { id, layer: "appointments", start, end, label: id, kind: "test" }
}

// Turns segments into "start end", so expectations are short and readable
function times(items: CalendarItem[]): string[] {
	return items.map((i) => `${i.start} ${i.end}`)
}

describe("splitByDay", () => {
	it.each([
		["bad", "zzz"],
		["2026-00-15T10:00", "2026-01-01T00:00"],
	])("returns nothing for an invalid time (%s), instead of looping forever", (start, end) => {
		expect(splitByDay(item(start, end))).toEqual([])
	})

	it("keeps an item within one day as it is", () => {
		expect(times(splitByDay(item("2026-11-05T10:00", "2026-11-05T12:00")))).toEqual([
			"2026-11-05T10:00 2026-11-05T12:00",
		])
	})

	it("keeps an item ending at 24:00 as one segment", () => {
		expect(times(splitByDay(item("2026-11-05T18:00", "2026-11-06T00:00")))).toEqual([
			"2026-11-05T18:00 2026-11-06T00:00",
		])
	})

	it("splits an item crossing midnight in two", () => {
		expect(times(splitByDay(item("2026-11-05T22:00", "2026-11-06T02:00")))).toEqual([
			"2026-11-05T22:00 2026-11-06T00:00",
			"2026-11-06T00:00 2026-11-06T02:00",
		])
	})

	it("splits correctly across the clock change", () => {
		expect(times(splitByDay(item("2026-10-24T20:00", "2026-10-26T03:00")))).toEqual([
			"2026-10-24T20:00 2026-10-25T00:00",
			"2026-10-25T00:00 2026-10-26T00:00",
			"2026-10-26T00:00 2026-10-26T03:00",
		])
	})

	it("keeps the other fields on every segment", () => {
		const segments = splitByDay(item("2026-11-05T22:00", "2026-11-06T02:00", "x"))
		expect(segments.every((s) => s.id === "x" && s.label === "x")).toBe(true)
	})
})

describe("itemsInRange", () => {
	const november6 = { start: new Date(2026, 10, 6), end: new Date(2026, 10, 7) }

	it.each([
		["inside the range", "2026-11-06T10:00", "2026-11-06T12:00", true],
		["the day before", "2026-11-05T10:00", "2026-11-05T12:00", false],
		["ending exactly when the range starts", "2026-11-05T18:00", "2026-11-06T00:00", false],
		["partly inside", "2026-11-05T22:00", "2026-11-06T02:00", true],
		["covering the whole range", "2026-11-01T00:00", "2026-11-30T00:00", true],
	])("an item %s → included: %s", (_, start, end, included) => {
		expect(itemsInRange([item(start, end)], november6)).toHaveLength(included ? 1 : 0)
	})

	it("returns nothing for an empty range", () => {
		const empty = { start: new Date(2026, 10, 6), end: new Date(2026, 10, 6) }
		expect(itemsInRange([item("2026-11-05T22:00", "2026-11-06T02:00")], empty)).toEqual([])
	})
})