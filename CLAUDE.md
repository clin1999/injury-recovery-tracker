# ITB recovery tracker

A mobile-first web app for tracking an 8-week return-to-running programme after iliotibial band (ITB) irritation, combined with the user's weekly gym, badminton and Saturday 5k routine. It is a personal tool for one user, opened on their phone at the gym and after runs.

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
- Only activities whose type contains "run" count. Runs on the same date are added together. A run on a planned run day (Tuesday or Saturday) goes there. A run on another day counts as the nearest run day in that week that the import hasn't already filled (ties go to the earlier day). Anything left over is reported as an extra run.
- Runs before the start date or after week 8 are skipped and counted in the dialog. Nothing changes until the user confirms the preview.
- Importing sets `km` (up to 2 decimals) and ticks the day's Run task. It never touches pain scores or other tasks. Re-importing the same file changes nothing.

## Backup and restore

Logs live only in the device's `localStorage`, so the settings card has Back up and Restore.

- A backup is `itb-tracker-backup-YYYY-MM-DD.json` containing `{"app": "itb-tracker", "version": 1, "exported": <ISO time>, "data": <the saved state>}`.
- On a touch device that can share files, Back up opens the share sheet (Save to Files, Drive, email). Otherwise it downloads the file. Cancelling the share sheet leaves `lastBackup` unchanged.
- Restore accepts the wrapper or bare saved data with a `weeks` object. It shows the backup's and the device's totals side by side and replaces everything only after confirmation. The restored data goes through `normalise()`, the same repair used on load.
- The weekly summary shows a reminder when there is logged data and no backup in the last 7 days.

## Weekly plan

This is plan version 2 (`PLAN_VERSION` in `plan.js`). The user goes to the gym every day except Wednesday, when they play badminton, and runs a 5k on Saturday mornings. The ITB strength work stays on the two leg days, and the other gym days add upper body and core so every day has a full session.

- Monday, Legs A: single-leg RDL, Bulgarian split squat, hip thrust, side plank.
- Tuesday, Push and short run: easy treadmill run first, then dumbbell bench press, seated shoulder press, push-ups and triceps pushdown.
- Wednesday, Badminton: hip warm-up (band walks, clamshells) before, figure-4 and hip flexor stretches and ball release after.
- Thursday, Legs B: step-downs, cable hip abduction, lateral lunge, single-leg bridge, dead bug.
- Friday, Pull and core: rower warm-up, lat pulldown, seated cable row, face pull, dumbbell curl, Pallof press. Deliberately easy on the legs before Saturday.
- Saturday, 5k run: warm-up, the run, stretches.
- Sunday, Full body, lighter: rower or bike, incline dumbbell press, one-arm dumbbell row, farmer's carry, front plank. There's no full rest day, so Sunday stays light.

Each `PLAN` task is `[name, detail, [exerciseKeys]]`. The keys point into `EX` and drive the "How to" panel. An empty array means no How to button. A run day has `run: 'short'` or `run: '5k'`, and its run task must be named `Run` (the Garmin import ticks it by name). Tasks are saved by position, so reordering or replacing tasks needs a new `PLAN_VERSION` and a step in `migrate()` in `app.js`. Adding a task at the end of a day is safe without one.

`month.js` has a short column label per day in `SHORT`. Keep them to about 6 characters so the grid fits at phone width.

## Run targets and pain rules

These rules are the core logic. Keep them consistent if you change anything.

- Saturday's target is a fixed 5 km from week 1 (the user chose the full 5k over building up to it, so the pain verdicts are what tell them to run/walk). Tuesday's short run is `base × 1.1^(week − 1)`, capped at 4 km so it stays short. `base` defaults to 3 km and is editable in settings. The weekly target in the Month tab is the sum of both.
- Per run, the user logs distance, pain during (0–10) and pain next morning (0–10). The worst of the two decides the verdict: 0–3 means within limits, 4–5 means back off (halve the next run or switch to run/walk), and 6 or above means stop running for 2–3 days and see a physio if it repeats.
- The weekly summary says to move up to next week's Tuesday distance only when every run that week is fully logged (pain during and next morning) and within limits. At 4–5 it says to repeat Tuesday's distance and run/walk the 5k. At 6 or above it says to drop Tuesday back, walk or skip the 5k, and see a physio if it repeats.
- From week 4 a banner prompts a physio visit if pain isn't clearly easing.

## Data

Everything is stored in `localStorage` under the key `itb-tracker-v1`:

```json
{
  "week": 1,
  "base": 3,
  "start": "2026-11-02",
  "lastBackup": "2026-11-23",
  "plan": 2,
  "weeks": {
    "w1": { "0": { "tasks": [true, false], "km": "3.2", "pd": 2, "pn": 1, "sw": { "2": "gobletsq" } } }
  }
}
```

Day keys are indices 0–6 (Monday to Sunday). `pd` and `pn` are pain during and pain next morning. `start` is the Monday of week 1 as an ISO date, or null when not set (it was added later, so older saves simply don't have it). Any date the user picks snaps back to that week's Monday. Logs are keyed by programme week and day, not by date, so changing the start date moves the dates, not the logs. All storage access is wrapped in try/catch, and the app must render correctly with empty storage. `lastBackup` is the local date of the last backup, or null. On load and on restore, `normalise()` clamps `week` to 1–8, falls back to 3 for a bad `base`, resets a non-object `weeks` and turns an invalid `start` or `lastBackup` into null, while every other saved field is kept. If you change the schema, bump the key or migrate the old data so the user's logs aren't lost.

`plan` is the plan version the logs belong to. Saved data without it is plan 1 (Tue/Fri/Sun runs, Wednesday mobility, Saturday rest). `normalise()` ends with `migrate()`, which moves older logs onto the current plan. For plan 1 → 2, Mon, Tue and Thu ticks stay put, Wednesday's mobility ticks map onto the new stretches and ball release, and the old Sunday run (or Friday's, if Sunday had none) becomes Saturday's 5k log. Fri and Sun start empty. Before migrating stored data on load, the app keeps an untouched copy under `itb-tracker-v1-before-plan2`. Restoring an old backup goes through the same migration.

## Illustrations

The pictures are inline SVG illustrations of a person in a `0 0 200 112` viewBox, with the ground at y = 108. A pose is joint coordinates: `F({f, h, s, p, kn, fn, en, hn, kf, ff, ef, hf})` takes the head centre, shoulder, hip, near knee/foot/elbow/hand, and optional far-side limbs. `f` is 1 when the person faces right (the default) and -1 when they face left; it sets which way the face and toes point.

`F()` builds the person from tapered capsules (`cap()`): skin, hair, T-shirt, shorts and trainers. It draws in layers, each outlined: far leg, far arm (both shaded darker), then the body, near leg and head, then the near arm on top. Props (bench, box, ball, band, cable, machines) are plain SVG elements drawn before the figure, except bands, which go on top. `DB(x, y)` draws a dumbbell. Colours are CSS variables (`--skin`, `--shirt`, `--shorts` and so on), so the drawings follow the theme. When you add a pose, check it at full size: a thick limb can hide the face or a prop.

## Muscles and replacements

- `MUS` in `plan.js` gives each exercise its main and supporting muscles (ids from `MUSCLE_NAMES`). `KIND` marks cardio and mobility exercises; everything else is strength.
- How to shows the picture, a front-and-back muscle map (`muscleMap()`: main muscles in `--mus-p`, supporting in `--mus-s`) and a Main / Also list. Mobility exercises say Stretches instead of Main. The day list shows each exercise's main muscles under its sets.
- Every task has a Replace button. Replacing is for that day only and is stored in the day's `sw` object: `sw[taskIndex]` is an `EX` key, or `{ "name": "..." }` for something the user typed (escaped before display, at most 60 characters). Ticks stay on the task, so progress and celebrations are unchanged. "Go back to ..." removes the entry.
- `alternatives()` suggests exercises of the same kind that share a main muscle, ranked by how closely the main muscles match. The run, badminton and the bike warm-up are never suggested.
- A replaced Run task means the run log is hidden, and that run is left out of the weekly summary and the Month tab totals and targets. A Garmin import for that day removes the replacement, because the person ran after all.
- Exercises only used as replacements (goblet squat, leg press and so on) live in the `Object.assign(EX, {...})` block.

## Conventions

- Use New Zealand English spelling and metric units. Format dates in prose as dd-mmm-yyyy (for example 23-Nov-2026).
- Write UI copy in sentence case, with plain verbs and no em dashes.
- Keep the layout mobile-first (it is used on a phone around 380 px wide), with safe-area insets handled, visible keyboard focus, and both light and dark modes working.

## Known limitations

- Data lives in one browser on one device, with no sync. Backups are manual: anything logged since the last backup is lost if the home-screen app is deleted or site data is cleared.
- Garmin runs come in by CSV export only, and pain still has to be entered by hand.
- The illustrations show one position per exercise. They are not photos or video, and the muscle maps are simplified.
- The programme is general guidance, not a clinical prescription. Keep the physio prompts in place.
