import { page } from "$app/state"

export interface NavigationItem {
	href: string
	label: string
	icon: string
	badgeCount?: number
	isInBottomBar: boolean
}

export function getNavigationItems(): NavigationItem[] {
	return [
		{ href: "/", label: "Forside", icon: "home", isInBottomBar: true },
		{ href: "/calendar", label: "Kalender", icon: "calendar_month", isInBottomBar: true },
		{ href: "/notifications", label: "Varsler", icon: "notifications", badgeCount: 0, isInBottomBar: true },
		{ href: "/clients", label: "Kunder", icon: "group", isInBottomBar: true },
		{ href: "/appointments", label: "Avtaler", icon: "format_list_bulleted", isInBottomBar: false },
		{ href: "/requests", label: "Forespørsler", icon: "inbox", badgeCount: 0, isInBottomBar: true }
	]
}

export function isCurrentPage(href: string): boolean {
	return href === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(href)
}

export function formatBadgeCount(count: number): string {
	return count > 99 ? "99+" : String(count)
}

export function handleNavigationClick(item: NavigationItem) {
	if (item.href === "/calendar" && isCurrentPage(item.href)) {
		console.log("heisann");
	}
}
