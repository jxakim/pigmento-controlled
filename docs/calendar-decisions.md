# Calendar flow

1. Time model: Local time as strings, "2026-11-05T10:00". No timestamps and no time zones. The end is exclusive
2. Midnight: An item may end on the next date ("2026-11-06T00:00" for "until midnight"). Anything longer is split into one segment per day when it is shown
3. Week: Starts Monday, ISO week numbers, Norwegian locale
4. Date arithmetic: Always new Date(y, m, d + n). Never add 24 x 3600 x 1000, because it breaks on the clock change (last Sunday of October)
5. Levels: year | month | week | day, with the parent of each (day → week → month → year)
6. Address: `/calendar?visning=day&dato=2026-11-05`
7. Visible hours: 07:00–19:00 by default, and it grows to fit the content, up to 24:00
8. Not now: Time zones, recurring appointments, drag and drop, several users
