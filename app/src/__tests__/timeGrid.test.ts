import { describe, expect, it } from "vitest"
import type { CalendarItem } from "../lib/calendar/logic/items"
import { getVisibleHours, layoutOverlaps } from "../lib/calendar/logic/timeGrid"

function item(start: string, end: string, id = "a"): CalendarItem {
	return { id, layer: "appointments", start, end, label: id, kind: "test" }
}

describe("getVisibleHours", () => {
	const november5 = { start: new Date(2026, 10, 5), end: new Date(2026, 10, 6) }

	it.each([
		["no items", [], 7, 19],
		["an item inside the default hours", [item("2026-11-05T09:00", "2026-11-05T10:00")], 7, 19],
		["a late shift", [item("2026-11-05T12:00", "2026-11-05T23:00")], 7, 23],
		["an item until midnight", [item("2026-11-05T18:00", "2026-11-06T00:00")], 7, 24],
		["an early start on the half hour", [item("2026-11-05T06:30", "2026-11-05T08:00")], 6, 19],
		["an end on the quarter hour", [item("2026-11-05T17:00", "2026-11-05T19:15")], 7, 20],
		["only the part after midnight", [item("2026-11-04T22:00", "2026-11-05T02:00")], 0, 19],
		["an item on another day", [item("2026-11-06T22:00", "2026-11-06T23:00")], 7, 19],
	])("%s → %i–%i", (_, items, start, end) => {
		expect(getVisibleHours(items, november5)).toEqual({ start, end })
	})
})

describe("layoutOverlaps", () => {
	function columns(items: CalendarItem[]): string[] {
		return layoutOverlaps(items).map((p) => `${p.item.id}: ${p.column}/${p.columns}`)
	}

	it("gives an item alone the full width", () => {
		expect(
            columns([item("2026-11-05T10:00", "2026-11-05T11:00", "A")])
        ).toEqual(["A: 0/1"])
	})

	it("puts two overlapping items side by side", () => {
		expect(
			columns([
                item("2026-11-05T10:00", "2026-11-05T12:00", "A"), 
                item("2026-11-05T11:00", "2026-11-05T13:00", "B")
            ]),
		).toEqual(["A: 0/2", "B: 1/2"])
	})

	it("does not count an item that starts when the other ends as an overlap", () => {
		expect(
			columns([
                item("2026-11-05T10:00", "2026-11-05T11:00", "A"),
                item("2026-11-05T11:00", "2026-11-05T12:00", "B")
            ]),
		).toEqual(["A: 0/1", "B: 0/1"])
	})

	it("places two items with the same start time side by side, longest first", () => {
		expect(
			columns([
                item("2026-11-05T14:00", "2026-11-05T15:00", "short"),
                item("2026-11-05T14:00", "2026-11-05T15:30", "long")
            ]),
		).toEqual(["long: 0/2", "short: 1/2"])
	})

	it("reuses a column once it is free", () => {
		expect(
			columns([
				item("2026-11-05T09:00", "2026-11-05T11:00", "A"),
				item("2026-11-05T10:00", "2026-11-05T12:00", "B"),
				item("2026-11-05T11:00", "2026-11-05T13:00", "C"),
			]),
		).toEqual(["A: 0/2", "B: 1/2", "C: 0/2"])
	})

	it("gives separate groups their own width", () => {
		expect(
			columns([
				item("2026-11-05T09:00", "2026-11-05T11:00", "A"),
				item("2026-11-05T10:00", "2026-11-05T12:00", "B"),
				item("2026-11-05T16:00", "2026-11-05T17:00", "C"),
			]),
		).toEqual(["A: 0/2", "B: 1/2", "C: 0/1"])
	})

	it("returns nothing for no items", () => {
		expect(layoutOverlaps([])).toEqual([])
	})
})