# ITB recovery tracker

A mobile-first web app for tracking an 8-week return-to-running programme after iliotibial band (ITB) irritation. It is a personal tool for one user, opened on their phone at the gym and after runs.

## Background

ITB irritation usually shows up as pain on the outside of the knee that builds during longer runs. The programme is for a runner coming back from it: someone who has rested and started strengthening, and can manage short runs with slight, bearable pain. It is built around hip and glute strengthening plus a gradual, pain-guided increase in running.

## Running it

No build step and no dependencies. Open `index.html` in a browser, or serve the folder (for example `python -m http.server 8417`). Scripts are classic `<script>` tags, not ES modules, so the page also works from `file://`. Load order matters: `plan.js`, `dates.js`, `month.js`, `garmin.js`, `backup.js`, then `app.js`. The only external resource is Google Fonts (Barlow and Barlow Condensed), with system fallbacks.

## Hosting and installing

The app is meant to be hosted on GitHub Pages (any static https host works) and added to the phone's home screen.

- `manifest.webmanifest` and the `apple-*` meta tags in `index.html` make it open full screen with its own icon. Paths are relative, so it works under a `/repo-name/` subpath.
- `sw.js` caches the app files for offline use (stale-while-revalidate: serve the cache, fetch a fresh copy for next time). Add any new file to its `FILES` list and bump `CACHE`. After pushing an update, the phone shows it on the second open.
- The service worker is not registered on `file://`, and not on localhost unless the address has `?sw`, so local edits show straight away. To test offline locally, open `http://localhost:8417/?sw`, then unregister it afterwards.
- Icons live in `icons/`. `icon.svg` is the favicon. The PNGs come from `python tools/make-icons.py` (standard library only), which draws the same design.
- On iPhone, a home-screen app has separate storage from Safari. Data logged in Safari won't appear in the home-screen app.

## Structure

- `index.html` contains the page shell: a sticky header with Week / Month tabs and the prev/next arrows, the week panel (banner, day list, weekly summary), the month panel, the settings card (start date, starting distance, Garmin import), the toast and the Garmin import dialog.
- `src/styles.css` holds design tokens on `:root`, with dark-mode overrides via `prefers-color-scheme` and a `data-theme` attribute. Both dark blocks must stay in sync.
- `src/plan.js` holds the content: `EX` (exercise library: name, SVG picture, steps, form cue), `PLAN` (seven days of tasks) and the SVG helpers.
- `src/dates.js` holds the date helpers. Dates are whole-day numbers counted in UTC, so daylight saving can't move a run onto the wrong day.
- `src/month.js` renders the Month tab. It reads logs with `peek()`, which never creates empty entries.
- `src/garmin.js` parses a Garmin Connect CSV, plans the import and runs the preview dialog. It also holds `openSheet` / `closeSheet`, shared by both dialogs.
- `src/backup.js` handles backup and restore.
- `src/app.js` holds state, persistence, rendering, settings, the day-complete celebration, events and service worker registration.

## Views

- The Week tab is the logging view. The Month tab shows the programme as two 4-week blocks (weeks 1–4, 5–8): a Mon–Sun grid per week (done, started, km run, worst pain badge), headline totals, week-by-week distance against target, and a pain trend line comparing the first logged week with the latest. Tapping a grid day opens that week with the day expanded. The arrows step weeks or blocks depending on the tab. The tab choice isn't saved, so the app always opens on the week.
- `render()` rebuilds the day list and grid with `innerHTML`, so it records the focused control (`focusKey()`) and restores focus afterwards. Give any new interactive control in the rebuilt areas a stable `data-` attribute that `focusKey()` can find.
- When a day's last task is ticked, `celebrate()` pops the tick, bursts confetti from it, sweeps the card and shows a toast (also read out by screen readers). Completing all 7 days adds a bigger burst from the header. With reduced motion turned on, only the toast and colour change happen.
- Pain colours always come with the number, never colour alone.
- With a programme start date set, each day shows its date, today is highlighted in both tabs, the Month tab header shows the date range, and the settings card offers a link to jump to the current week. The app doesn't jump there by itself, because people often log next-morning pain for Sunday on the Monday.

## Garmin import

There is no live Garmin sync. Garmin's official API needs developer programme approval and a server. Instead the user exports a CSV from Garmin Connect (Activities, then Export CSV) and picks it in the settings card. The file is read in the browser and never uploaded.

- Columns are found by header name: `Activity Type`, `Date` and `Distance` (case-insensitive, with a few fallbacks). Dates are read as `YYYY-MM-DD…`, falling back to `Date.parse`. Distances allow a decimal comma, thousands commas and `--`. Distances are taken as km unless the header says miles; the dialog has a km / miles switch.
- Only activities whose type contains "run" count. Runs on the same date are added together. A run on a planned run day (Tue, Fri, Sun) goes there. A run on another day counts as the nearest run day in that week that the import hasn't already filled (ties go to the earlier day). Anything left over is reported as an extra run.
- Runs before the start date or after week 8 are skipped and counted in the dialog. Nothing changes until the user confirms the preview.
- Importing sets `km` (up to 2 decimals) and ticks the day's Run task. It never touches pain scores or other tasks. Re-importing the same file changes nothing.

## Backup and restore

Logs live only in the device's `localStorage`, so the settings card has Back up and Restore.

- A backup is `itb-tracker-backup-YYYY-MM-DD.json` containing `{"app": "itb-tracker", "version": 1, "exported": <ISO time>, "data": <the saved state>}`.
- On a touch device that can share files, Back up opens the share sheet (Save to Files, Drive, email). Otherwise it downloads the file. Cancelling the share sheet leaves `lastBackup` unchanged.
- Restore accepts the wrapper or bare saved data with a `weeks` object. It shows the backup's and the device's totals side by side and replaces everything only after confirmation. The restored data goes through `normalise()`, the same repair used on load.
- The weekly summary shows a reminder when there is logged data and no backup in the last 7 days.

## Weekly plan

Monday is Strength A (single-leg RDL, Bulgarian split squat, hip thrust, side plank). Tuesday, Friday and Sunday are easy runs, with Sunday about 10% longer. Wednesday is mobility (ball release, figure-4 stretch, hip flexor stretch). Thursday is Strength B (step-downs, cable hip abduction, lateral lunge, single-leg bridge). Saturday is rest.

Each `PLAN` task is `[name, detail, [exerciseKeys]]`. The keys point into `EX` and drive the "How to" panel. An empty array means no How to button.

## Run targets and pain rules

These rules are the core logic. Keep them consistent if you change anything.

- The run target is `base × 1.1^(week − 1)`, where `base` defaults to 3 km and can be edited by the user. The Sunday target is 10% above that.
- Per run, the user logs distance, pain during (0–10) and pain next morning (0–10). The worst of the two decides the verdict: 0–3 means within limits, 4–5 means back off (halve the next run or switch to run/walk), and 6 or above means stop running for 2–3 days and see a physio if it repeats.
- The weekly summary says to add about 10% only when every run that week is fully logged (pain during and next morning) and within limits. Otherwise it says to repeat or drop back.
- From week 4 a banner prompts a physio visit if pain isn't clearly easing.

## Data

Everything is stored in `localStorage` under the key `itb-tracker-v1`:

```json
{
  "week": 1,
  "base": 3,
  "start": "2026-11-02",
  "lastBackup": "2026-11-23",
  "weeks": {
    "w1": { "0": { "tasks": [true, false], "km": "3.2", "pd": 2, "pn": 1 } }
  }
}
```

Day keys are indices 0–6 (Monday to Sunday). `pd` and `pn` are pain during and pain next morning. `start` is the Monday of week 1 as an ISO date, or null when not set (it was added later, so older saves simply don't have it). Any date the user picks snaps back to that week's Monday. Logs are keyed by programme week and day, not by date, so changing the start date moves the dates, not the logs. All storage access is wrapped in try/catch, and the app must render correctly with empty storage. `lastBackup` is the local date of the last backup, or null. On load and on restore, `normalise()` clamps `week` to 1–8, falls back to 3 for a bad `base`, resets a non-object `weeks` and turns an invalid `start` or `lastBackup` into null, while every other saved field is kept. If you change the schema, bump the key or migrate the old data so the user's logs aren't lost.

## Illustrations

The pictures are inline SVG stick figures in a `0 0 200 112` viewBox, with the ground at y = 108. `F({h, s, p, kn, fn, en, hn, kf, ff, ef, hf})` draws a figure from joint coordinates: head, shoulder, hip, near knee/foot/elbow/hand, and optional far-side limbs, which are rendered at lower opacity. Props (bench, box, ball, band, cable) are plain SVG elements added alongside. Colours come from CSS variables, so the drawings follow the theme.

## Conventions

- Use New Zealand English spelling and metric units. Format dates in prose as dd-mmm-yyyy (for example 23-Nov-2026).
- Write UI copy in sentence case, with plain verbs and no em dashes.
- Keep the layout mobile-first (it is used on a phone around 380 px wide), with safe-area insets handled, visible keyboard focus, and both light and dark modes working.

## Known limitations

- Data lives in one browser on one device, with no sync. Backups are manual: anything logged since the last backup is lost if the home-screen app is deleted or site data is cleared.
- Garmin runs come in by CSV export only, and pain still has to be entered by hand.
- The illustrations show position only. They are not photos or video.
- The programme is general guidance, not a clinical prescription. Keep the physio prompts in place.
