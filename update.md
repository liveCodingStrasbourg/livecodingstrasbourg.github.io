# Updating the site: from edit to online

Step-by-step recipes for the usual changes, and how to put them online.
For the full list of fields of each content type, see [EDITING.md](EDITING.md).

- [1. Where the site lives](#1-where-the-site-lives)
- [2. One-time setup on a computer](#2-one-time-setup-on-a-computer)
- [3. The editing loop](#3-the-editing-loop)
- [4. Recipes](#4-recipes)
- [5. Putting it online](#5-putting-it-online)
- [6. Editing without a computer setup (github.com)](#6-editing-without-a-computer-setup-githubcom)
- [7. The switch: making the new site live (one time)](#7-the-switch-making-the-new-site-live-one-time)
- [8. Going back if something goes wrong](#8-going-back-if-something-goes-wrong)

---

## 1. Where the site lives

- **Repository:** `github.com/liveCodingStrasbourg/livecodingstrasbourg.github.io`
- **Live address:** https://livecodingstrasbourg.github.io
- **Branches:**
  - `main` → **what is online**. Every push to `main` is built and published
    automatically by GitHub Actions (1–2 minutes).
  - `new-site` → the new Astro site, **until the switch** (section 7). Pushes
    there are only *built* as a check, never published.

Until the switch, `main` still holds the old site. After the switch, `main` is
the new site and `new-site` is no longer needed.

---

## 2. One-time setup on a computer

You need **git** and **Node.js 22 or newer** (`node --version` to check).

```sh
git clone git@github.com:liveCodingStrasbourg/livecodingstrasbourg.github.io.git
cd livecodingstrasbourg.github.io
git switch new-site      # only until the switch; afterwards stay on main
npm install
```

You need write access to the repository: ask an admin of the
liveCodingStrasbourg GitHub organisation to add you.

---

## 3. The editing loop

Every time:

```sh
git pull                 # 1. get the latest version (others may have edited)
npm run dev              # 2. local preview at http://localhost:4321
```

3. Edit files. The browser refreshes on each save; errors show in the terminal
   and in the browser, naming the file and the field.
4. Stop the preview (`Ctrl+C`) and check the full build:

   ```sh
   npm run build
   ```

   If it ends with `Complete!`, it will also build on GitHub.
5. Save and publish — see [section 5](#5-putting-it-online).

---

## 4. Recipes

### Add an event / workshop

1. Copy a similar file in `src/content/agenda/`, e.g.
   `2026-10-21-atelier-shadok.md`.
2. Rename it `YYYY-MM-DD-short-name.md` (lowercase, dashes, no accents).
3. Change `title`, `date`, `time_start`, `time_end`, `location`, `description`
   (+ `_en` versions). Remove fields you don't need.
4. Check it on http://localhost:4321/agenda.

It appears on the homepage, in "À venir" and in the RSS feed automatically,
and moves to the past events by itself the night after (nightly rebuild).

### Announce a workshop theme

Open the event file and replace the subtitle:

```yaml
subtitle: "Thème : les filtres"
subtitle_en: "Theme: filters"
```

### Add a poster or photos to an event

1. Convert to `.webp` (≈1600 px wide, < 500 KB), e.g. with squoosh.app.
2. Put the files in `public/images/chaos-labs/` (e.g. `cl13-poster.webp`,
   `cl13-01.webp`…).
3. In the event file:

   ```yaml
   cover_image: "/images/chaos-labs/cl13-poster.webp"
   photos:
     - "/images/chaos-labs/cl13-01.webp"
     - "/images/chaos-labs/cl13-02.webp"
   ```

   Paths start with `/images/`, never with `public/`.

### Add a ticket link, a video link, a venue link

In the event's `links:` list (each is a button on the event page):

```yaml
links:
  - label: "Billetterie HelloAsso"
    url: "https://www.helloasso.com/…"
  - label: "Video : Crash Server"
    url: "https://www.youtube.com/watch?v=…"
```

To *embed* one video in the page instead, use
`video_url: "https://www.youtube.com/embed/VIDEO_ID"` (note `embed/`, not `watch?v=`).

### Add an artist

1. Create `src/content/artists/artist-name.md` (copy `noisk8.md`).
2. Fill `name`, `bio`, `bio_en`, `tools`, `links`.
3. Add `collective: true` only for community members — they get a card on the
   Artists page. Guests don't need it: their name becomes clickable in the
   events where they're listed under `participants`, as long as it's spelled
   like `name`.

### Add a tool / software to the Resources page

Create `src/content/tools/tool-name.md` (copy `ibniz.md`). `category` must be
`audio`, `visual` or `other`; `url` must start with `https://` or `http://`.
Add `community: true` for tools made by the community.

### Add a photo or video to the Media page

Create a file in `src/content/media/` (copy `atelier-jam.md`); `type` is
`video`, `image`, `audio` or `link`. For an image, put the file in
`public/images/media/` and set `url: "/images/media/your-file.webp"`.

### Change a contact link (email, Discord, socials)

Edit the `links` list at the top of **both** `src/pages/contact.astro` and
`src/pages/en/contact.astro`.

### Change the friend venues list (Linkothèque)

Edit the `friends` list in **both** `src/pages/ressources.astro` and
`src/pages/en/ressources.astro`.

### Change the homepage text, FAQ, charter

Edit the text between the tags in the French file **and** its English twin:

| | French | English |
|---|---|---|
| Homepage + FAQ | `src/pages/index.astro` | `src/pages/en/index.astro` |
| Charter | `src/pages/ressources/charte.astro` | `src/pages/en/ressources/charte.astro` |

Only change words between `>` and `<`; leave the tags and anything in `{ }` alone.

### Create a new keyword / tag

Just type it in the `tags:` list of an event — nothing else to declare. Keep
the same spelling everywhere (lowercase). The fixed lists (`type`,
`category`…) are the exception: see "Keywords, tags & categories" in
[EDITING.md](EDITING.md).

### Remove something

Delete the file (event, artist, tool, media). If it was a page people may have
bookmarked, add a redirect in `astro.config.mjs` (see EDITING.md → Links).

---

## 5. Putting it online

Once `npm run build` passes:

```sh
git add -A
git commit -m "Agenda: add Chaos Lab XIII"     # short description of the change
git push
```

Then open the repository's **Actions** tab on GitHub:

- a yellow dot = building, a green check = done, a red cross = failed
  (click it to see the error — usually the same message `npm run build` gives).

**After the switch** (pushing to `main`): green check = **online**, 1–2
minutes after the push. Reload https://livecodingstrasbourg.github.io (force
reload with `Ctrl+Shift+R` if you still see the old version).

**Before the switch** (pushing to `new-site`): green check = it builds
correctly, **nothing goes online**. To preview the result, run
`npm run build && npm run preview` locally.

If `git push` is refused because someone else pushed first:

```sh
git pull --rebase
git push
```

---

## 6. Editing without a computer setup (github.com)

Good for small text changes (typo, theme, link):

1. Open the repository on github.com, pick the right branch (`main`, or
   `new-site` before the switch) in the branch menu.
2. Navigate to the file (e.g. `src/content/agenda/…`), click the **pencil** icon.
3. Edit, then **Commit changes** (commit directly to the branch).
4. Watch the Actions tab as in section 5.

To add images: open the folder (e.g. `public/images/chaos-labs/`), then
**Add file → Upload files**.

There is no preview this way, so a mistake shows up as a red cross in Actions;
fix the file the same way and commit again. The live site keeps the previous
version until a build succeeds.

---

## 7. The switch: making the new site live (one time)

Do this once the association has reviewed the new site. Run from the project
folder, with `livesite` pointing at the association repository
(`git remote -v` to check; add it with
`git remote add livesite git@github.com:liveCodingStrasbourg/livecodingstrasbourg.github.io.git`).

```sh
git fetch livesite

# 1. Keep a copy of the old site as the branch "old-site"
git push livesite livesite/main:refs/heads/old-site

# 2. Replace main with the new site (this publishes it)
git push --force livesite livesite/new-site:main
```

Then:

1. Watch the Actions tab: the "Deploy to GitHub Pages" run on `main` should go
   green; the site is live 1–2 minutes later.
2. Check https://livecodingstrasbourg.github.io, a few old links
   (`/chaoslab`, `/audio-visualizer.html`, `/supermarket.html`) and the English
   version.
3. On every computer that had cloned the repository, re-sync:

   ```sh
   git fetch livesite
   git switch main
   git reset --hard livesite/main
   git branch -u livesite/main
   ```

   (This discards local uncommitted changes on `main` — commit or copy them first.)
4. When everything is fine, delete the `new-site` branch on GitHub
   (Branches page → trash icon). From now on, everyone works on `main`.

Note: the old site's workflow (`astro.yml`) disappears with the old `main`;
the new `deploy.yml` takes over automatically, nothing to configure.

---

## 8. Going back if something goes wrong

**Undo the last change** (site broken after an edit):

```sh
git revert HEAD
git push
```

This creates a commit that cancels the previous one; the fixed site goes online
after the build.

**Return to the old site** (after the switch, if the new site has a serious
problem):

```sh
git push --force livesite livesite/old-site:main
```

The old site is published again in 1–2 minutes (with its own `astro.yml`
workflow). Fix the new site on `new-site`, then redo the switch.
