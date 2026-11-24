# ITB recovery tracker

An 8-week, pain-guided return-to-running tracker with illustrated exercise instructions, built around a full gym week:

| Day | Session |
|---|---|
| Mon | Legs A: ITB strength work |
| Tue | Push (chest, shoulders, triceps) and a short easy run |
| Wed | Badminton, with a hip warm-up and stretches |
| Thu | Legs B: ITB strength work and core |
| Fri | Pull (back, biceps) and core |
| Sat | 5k run |
| Sun | Lighter full body and easy cardio |

- **Week tab:** tick off each day's exercises, log distance and pain for the two runs, and get a verdict on each run and on the week.
- **Month tab:** see four weeks at a glance, with distance against target, worst pain per week and whether pain is easing.
- **Garmin import:** fill in run distances from a Garmin Connect CSV export. The file is read on your phone and never uploaded.
- **Backup and restore:** save your logs to a file and bring them back on a new phone.
- **Works offline** once it's been opened, and can be added to your home screen like an app.

It's general guidance, not a clinical prescription. If pain isn't easing, see a physio.

## Use it on your phone

1. Open the hosted address (see below) on your phone.
2. Add it to your home screen:
   - **iPhone (Safari):** tap Share, then Add to Home Screen.
   - **Android (Chrome):** tap the ⋮ menu, then Add to home screen or Install app.
3. From then on, open it from the home-screen icon. On iPhone the icon has its own storage, separate from Safari, so log everything from the icon.

Your logs are stored only on that phone. Deleting the home-screen app or clearing website data deletes them, so back up now and then:

- **Back up:** Settings → Back up. On a phone this opens the share sheet. Save the file to iCloud Drive or Google Drive, or email it to yourself.
- **Restore:** on the new phone (or after a reset), open the app, go to Settings → Restore and pick the backup file. You'll see what's in it before anything is replaced.

The weekly summary reminds you if it's been more than a week since your last backup.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository.
2. On GitHub, open the repository's **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, and save.
4. After a minute or so the site is live at `https://<your-username>.github.io/<repository-name>/`.

GitHub Pages is free for public repositories. A private repository needs a paid GitHub plan for Pages.

## Run it locally

No build step and no dependencies. Open `index.html` directly, or serve the folder:

```
python -m http.server 8417
```

See `CLAUDE.md` for structure, logic and conventions.
