import { describe, expect, it } from "vitest"

import type { Period } from "../lib/calendar/logic/period"
import {
	formatAddress,
    parseAddress
} from "../lib/calendar/logic/address"

describe ("formatAddress", () => {
    it("writes level and date as query parameters", () => {
        const period: Period = { level: "year", date: new Date(2026, 10, 5) }
        expect(formatAddress(period)).toBe("/calendar?visning=year&dato=2026-11-05")
    })
})

describe ("parseAddress", () => {
    it("parses what formatAddress writes", () => {
        const period: Period = { level: "week", date: new Date(2026, 10, 5) }
        const query = formatAddress(period).split("?")[1]

        expect(parseAddress(new URLSearchParams(query))).toEqual(period)
    })

    it.each([
		["visning=week&dato=2026-02-31"], // a date that doesn't exist
		["visning=pigmento&dato=2026-11-05"], // unknown level
		["visning=day"], // missing dato
		["dato=2026-11-05"], // missing visning
		["visning=day&dato=2026-1-5"], // no zero padding
		[""], // nothing at all
	])("rejects %s", (query) => {
		expect(parseAddress(new URLSearchParams(query))).toBeUndefined()
	})
})