# Plan: building the calendar from scratch

A step-by-step plan for building a mobile-first calendar for a small business (one owner, appointments, work hours, notes and notifications). It is written so it can be followed in any project. Each phase is meant to be one small pull request that works on its own.

## Context

- **Stack assumed:** SvelteKit with Svelte 5 (runes), TypeScript, Vitest, Biome. Adapt the file names to your own conventions.
- **Views:** year, month, week, day. Mobile first, desktop second.
- **Layers shown in the calendar:** appointments, planned and worked hours, notifications (day markers), notes.
- **Lessons this plan is built on** (from a first version that used FullCalendar):
  - The hardest things to add late were: late hours past 22:00, an hour range that grows with the content, the work hours drawn behind appointments, extra content in month cells, and state in the address.
  - The parts written by hand (year view, mobile month, mobile week) gave the fewest problems.
  - A third-party calendar library is a good fit when you need drag and drop or recurring events. It is a poor fit for a phone-first design with custom layers.

## Principles

1. **Mobile first.** Build each view for a phone, then widen it for desktop with CSS.
2. **Pure logic first.** Dates, layout and the address are plain TypeScript functions with tests. Components only render their results.
3. **One source of truth per concept.** Appointment types, the breakpoint, colors and the address format each live in exactly one file.
4. **Layers, not special cases.** Views never know about appointments, hours, notes or notifications. They ask layers for items.
5. **Small steps.** One phase, one pull request. Lint, type check and tests pass on every one.

## Phase 0: Decisions (half a day, no code)

Write these in `docs/calendar-decisions.md` and treat them as fixed.

1. **Time model:** Local time as strings (`"2026-11-05T10:00"`). No timestamps and no time zones. The end is exclusive.
2. **Midnight:** An item may end on the next date (`"2026-11-06T00:00"` for "until midnight"). Anything longer is split into one segment per day when shown.
3. **Week:** Starts Monday, ISO week numbers, Norwegian locale (`nb-NO`).
4. **Date arithmetic:** Always `new Date(year, month, day + n)`. Never add `24 * 3600 * 1000`, because it breaks on the clock change (last Sunday of October).
5. **Levels:** `year | month | week | day`, with a parent for each (day → week → month → year).
6. **Address:** `/calendar?visning=day&dato=2026-11-05`.
7. **Visible hours:** 07:00–19:00 by default. The range grows to fit the content, up to 24:00.
8. **Not now:** Time zones, recurring appointments, drag and drop, several users.

## Phase 1: Pure logic with tests (1–2 days)

Folder `src/lib/calendar/`:

| File | Contents |
| --- | --- |
| `dates.ts` | `parseIsoDate`, `formatIsoDate`, `isSameDay`, `getDaysInRange`, `getMonthGridDays`, `getIsoWeekNumber` |
| `period.ts` | `type Period = { level; date }`, `getRange`, `move(period, n)`, `getParent`, `getKey` (for notes), `formatTitle`, `formatCompact` ("Nov 2026", "Uke 47 · 23.–29. nov") |
| `address.ts` | `formatAddress(period)` and `parseAddress(params)`, which returns nothing for bad input |
| `items.ts` | `type CalendarItem = { id; layer; start; end; label; kind }`, `splitByDay(item)`, `itemsInRange(items, range)` |
| `timeGrid.ts` | `getVisibleHours(items, range)`, `toPercent(time, hours)`, `layoutOverlaps(items)` (column index and column count per item) |

Edge cases that need a test each:

- The week of 2026-10-25 (clock change).
- A month that starts on a Sunday.
- A week that crosses the new year (2026-12-28 is ISO week 53).
- An item ending at 24:00.
- An item crossing midnight.
- Two appointments with the same start time.
- An empty range.

**Done when:** the test run covers all of these and nothing in this folder imports Svelte.

## Phase 2: Layers and data (1–2 days)

```ts
interface CalendarLayer {
	id: string
	getItems(range: DateRange): CalendarItem[]
}
```

Build one layer at a time over sample data and simple in-memory state modules (`*.svelte.ts`):

1. **Appointments:** Color and label come from one config file for appointment types, keyed by a fixed ID.
2. **Work hours:** Planned and worked, as two kinds.
3. **Notification days:** Markers only, no time.
4. **Notes:** Keyed by `getKey(period)`.

A small registry (`getVisibleLayers()`) decides which layers are on. A toggle such as "Arbeidstid" simply removes a layer.

**Tests:** each layer returns the right items for a week, a month and an empty period.

## Phase 3: The page shell (1–2 days)

Route `/calendar` with only the frame:

- State `period` and `isMounted`, initialised from the address with `parseAddress`.
- URL sync with `goto(address, { replaceState: true, reset: false })`. Do not use the shallow `replaceState` from SvelteKit: it keeps the old URL in the history, so Back returns to the wrong view.
- Toolbar. Desktop: title, previous / today / next, view switcher. Mobile, two rows: back · period in the middle · today, then the view switcher.
- A swipe attachment (`swipe.ts`) for the next and previous period. Use pointer events, a minimum distance of about 60 px, and `touch-action: pan-y` on the calendar.
- A back button: the previous view if there is one, otherwise the parent level.
- The mobile layout as a flex column, so a hidden part leaves no gap (a grid with named areas leaves empty rows).

The views are empty boxes for now.

**Done when:** a reload keeps the view, Back from another page returns to the same day, and swipe changes the period.

## Phase 4: Month, mobile first (2 days)

The most used screen.

1. `MonthGrid.svelte`: 6 rows of days, dots from the layers, today and selected states. Rows flex to fill the space, with a minimum height of 2 rem.
2. `DayPanel.svelte` under the grid, with a **fixed height** (about 11 rem, lower on low screens). It shows the date, one line about the hours, the first two items with their description, and "og N fler". The whole box is one button that opens the day. It never changes height.
3. Desktop month: the same grid with taller cells and chips inside the cells. Mostly CSS.

**Done when:** pressing days with 0, 1, 2 and 3 appointments gives the same panel height, at 390 × 844 and 375 × 667.

## Phase 5: The time column, day view (2–3 days)

`TimeColumn.svelte` is the one component for both day and week:

- Hour labels and gridlines.
- Background bands for the work hours (planned: dashed and hatched, worked: solid), drawn behind the items.
- Items placed with `toPercent` and `layoutOverlaps`.
- The visible hours come from `getVisibleHours`, so a late day makes the grid grow.
- On mobile, one line above the column: date and hours, for example "Fre 13 · Jobbet 12:00–23:00 ›", which links to the page where hours are edited.

**Tests (pure):** a late shift expands the range, and overlapping items split into columns.

## Phase 6: Week and year (2 days)

- **Week:** Seven `TimeColumn`s sharing one hour axis. On mobile, a simple list with one row per day is enough.
- **Year:** Twelve mini months where each day is colored by the dominant appointment type (a priority per type). Pressing a month opens it.
- Zoom animations between levels (View Transitions API) come last, and are polish.

## Phase 7: The rest of the page (1–2 days)

- Legend with counts per type.
- Notes: a card on desktop, a slim box that opens a sheet on mobile.
- Urgent notification strip.
- The "new booking" button. On mobile, put it in the bottom row next to the notes box, round and within reach of the thumb.

These only read layers or state modules and need no calendar logic of their own.

## Phase 8: Interaction (3–5 days)

1. **New booking:** A sheet with client, type, start, end, description and save. Use 16 px fields on mobile so iOS does not zoom.
2. **Edit and delete:** From the day panel and the day view.
3. **"Ikke tilgjengelig":** Block time without a client.
4. **Conflict check:** A pure function `findOverlaps(items, newItem)`. Warn, do not block.
5. Only then consider drag and resize.

## Phase 9: Persistence (2–3 days)

- Tables: `appointments`, `work_days`, `standard_week`, `notes`, `notification_state`.
- Row-level security for a single owner.
- Put every read and write behind the existing state-module functions, so no component changes.
- Update the screen first and save in the background. Show an error if the save fails.

## Phase 10: Polish and safety net (ongoing)

- A Playwright script that screenshots every view at 390 × 844, 375 × 667 and 1360 × 900, so a change that moves a layout is visible.
- Accessibility: real buttons, labels on icon buttons, visible focus, `prefers-reduced-motion`.
- Check the installed app on a real phone: safe areas (home indicator), zoom on fields, swipe against the iOS back gesture, hover states that stick after a tap (use `@media (hover: hover)`).

## Pull requests

One pull request per phase, stacked: 1 → 2 → 3 and so on. Phases 1 and 2 have no screens, so they are quick to review. Lint, type check and tests pass on every one, and every new function has a test.

## Risks

- **Overlap layout** has the most surprises. Do it with tests before the visual part.
- **The clock change and ISO week 53** are the classic date bugs. They are in the tests from phase 1.
- **Scope creep in phase 8.** Ship create and edit before anything fancy.
- **A grid with named areas on mobile.** A hidden part still leaves a gap. Use a flex column.
- **Shallow routing for the address.** It does not change what the history entry restores. Use `goto` with `replaceState: true`.

## Not now

Time zones, recurring appointments, drag and drop, several users, offline support. Revisit them once phases 1–9 are in use.
