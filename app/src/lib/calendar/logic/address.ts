import { isLevel, type Period } from "./period"
import { formatIsoDate, parseIsoDate } from "./dates"

export function formatAddress(period: Period): string {
	const params = new URLSearchParams({
		visning: period.level,
		dato: formatIsoDate(period.date),
	})
	return `/calendar?${params}`
}

export function parseAddress(params: URLSearchParams): Period | undefined {
    const level = params.get('visning')
    const dato = params.get('dato')

    if (!isLevel(level) || !dato) return undefined

    const date = parseIsoDate(dato)
    if (formatIsoDate(date) !== dato) return undefined;

    return { level, date }
}