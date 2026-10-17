# Editing the site

How to change the content of the TOPLAP Strasbourg / LiveCoding Strasbourg site.
Most edits are plain text files: no code knowledge needed.

- [Quick start](#quick-start)
- [Where everything lives](#where-everything-lives)
- [Text file basics (frontmatter)](#text-file-basics-frontmatter)
- [Agenda: events & workshops](#agenda-events--workshops)
- [Artists](#artists)
- [Resources: tools & software](#resources-tools--software)
- [Media](#media)
- [Projects](#projects)
- [Images](#images)
- [Keywords, tags & categories](#keywords-tags--categories)
- [Links](#links)
- [Pages that are written directly in code](#pages-that-are-written-directly-in-code)
- [Menu, interface words & translations](#menu-interface-words--translations)
- [Adding a new page](#adding-a-new-page)
- [Publishing](#publishing)
- [When something breaks](#when-something-breaks)

---

## Quick start

```sh
npm install        # once, after cloning
npm run dev        # starts the site at http://localhost:4321
```

Leave `npm run dev` running: every time you save a file, the page in your
browser refreshes. If you made a mistake in a file, the terminal (and the
browser) shows an error naming the file and the field.

Before publishing, check that the full build works:

```sh
npm run build
```

---

## Where everything lives

| What you want to change | Where |
|---|---|
| Events, workshops, Chaos Labs | `src/content/agenda/*.md` |
| Artists (Artists page + pop-ups on events) | `src/content/artists/*.md` |
| Software on the Resources page | `src/content/tools/*.md` |
| Photos / videos / audio on the Media page | `src/content/media/*.md` |
| Projects page | `src/content/projects/*.md` |
| Images | `public/images/…` |
| Contact page (email, Discord, socials) | `src/pages/contact.astro` and `src/pages/en/contact.astro` |
| Resources page: documentation row and "Linkothèque" | `src/pages/ressources.astro` and `src/pages/en/ressources.astro` |
| Charter | `src/pages/ressources/charte.astro` and `src/pages/en/ressources/charte.astro` |
| Course "Introduction au live coding" | `src/pages/ressources/cours-live-coding.astro` |
| Homepage text and buttons | `src/pages/index.astro` and `src/pages/en/index.astro` |
| Menu labels, page titles, tagline | `src/i18n/index.ts` |
| Colours (dark & light mode) | top of `src/styles/global.css` |
| Old URLs that should redirect | `redirects` in `astro.config.mjs` |

**Rule of thumb:** things in `src/content/` are bilingual in one file
(`title` + `title_en`, `description` + `description_en`…). Things in
`src/pages/` usually exist twice: once in French (`src/pages/…`) and once in
English (`src/pages/en/…`) — **edit both**.

---

## Text file basics (frontmatter)

Every content file is a `.md` file that starts and ends with `---`. Between
the two lines are fields, one per line:

```yaml
---
title: "Atelier livecoding au Shadok"
date: 2026-10-21
participants:
  - Crash Server
  - 520Still
links:
  - label: "Billetterie"
    url: "https://example.org/tickets"
---
```

Rules that avoid 90% of errors:

- **Put text in double quotes**: `title: "…"`. Inside the text, apostrophes
  are fine (`"L'atelier"`), but a double quote must be written `\"`.
- **Dates** are `YYYY-MM-DD`, without quotes: `date: 2026-10-21`.
- **Lists** are one item per line, starting with two spaces, a dash and a space
  (`  - Crash Server`). An empty list is `[]`.
- **Indentation uses spaces, never tabs.**
- Fields marked *optional* below can simply be left out.
- **Anything you write under the closing `---` is not shown on the site.**
  Put all visible text in `description` / `description_en`.

The **file name becomes the URL**: `src/content/agenda/2026-10-21-atelier-shadok.md`
→ `/agenda/2026-10-21-atelier-shadok`. Use lowercase, no spaces or accents,
dashes between words. Renaming a file changes its URL (and breaks links people
already shared — add a redirect if it was public, see [Links](#links)).

---

## Agenda: events & workshops

One file per event in `src/content/agenda/`. Name it `YYYY-MM-DD-short-name.md`
so files stay in date order.

**Upcoming vs past is automatic**: events dated today or later appear under
"À venir" and on the homepage (the next 4), older ones move to the past list.
Nothing to do when an event is over.

The quickest way to add one: **copy an existing similar event**, rename it,
change the fields.

```yaml
---
title: "Atelier livecoding au Shadok"                  # required
title_en: "Live coding workshop at Le Shadok"           # optional
type: "atelier"                                         # optional, see below
date: 2026-10-21                                        # required
time_start: "18h"                                       # optional
time_end: "22h"                                         # optional
duration: "21h++"                                       # optional, free text, instead of times
location: "Le Shadok, 25 Presqu'île André Malraux, 67100 Strasbourg"   # optional
subtitle: "Thème : les filtres"                         # optional, shown in orange under the title
subtitle_en: "Theme: filters"                           # optional
description: "Texte en français…"                       # required
description_en: "English text…"                         # optional
participants:                                           # optional – artist names
  - Crash Server
  - Pierre Danger
tools:                                                  # optional – software used
  - FoxDot
  - Hydra
tags:                                                   # optional – keywords
  - atelier
  - shadok
links:                                                  # optional – buttons under the text
  - label: "Billetterie HelloAsso"
    url: "https://www.helloasso.com/…"
cover_image: "/images/chaos-labs/cl12-poster.webp"      # optional – poster/cover
photos:                                                 # optional – gallery at the bottom
  - "/images/chaos-labs/cl12-01.webp"
  - "/images/chaos-labs/cl12-02.webp"
video_url: "https://www.youtube.com/embed/VIDEO_ID"     # optional – embedded video
---
```

Details:

- **`type`** must be one of: `atelier` (default), `chaos-lab`, `concert`,
  `jam`, `other`. It sets the label on the card ("Atelier", "Chaos Lab", …).
- **`participants`**: if a name matches an artist file (see [Artists](#artists)),
  it becomes clickable and opens a pop-up with the bio and links. Matching
  ignores case, spaces and anything in parentheses, so
  `Crash Server (Strasbourg, FR)` still matches `Crash Server`.
- **No `cover_image`?** A random pattern is generated from the title. That's fine.
- **`video_url`** must be the **embed** form of a YouTube link:
  `https://www.youtube.com/watch?v=Ercyh2hE0HE` → `https://www.youtube.com/embed/Ercyh2hE0HE`.
  For extra videos, use `links` with the normal YouTube URL instead.
- If the English fields are missing, the English site shows the French text.

**Updating an event later** (e.g. the theme is announced): just edit the
`subtitle` / `subtitle_en` / `description` in the same file.

**Cancelling an event**: delete the file, or keep it and say so in the
`subtitle` ("Annulé" / "Cancelled").

New events also appear automatically in the RSS feed (`/rss.xml`).

---

## Artists

One file per artist or collective in `src/content/artists/`, e.g. `noisk8.md`.

```yaml
---
name: "Noisk8"                        # required – must match how you write it in events
collective: true                      # optional – see below
image: "/images/artists/noisk8.webp"  # optional
tools:                                # optional
  - FoxDot
  - SuperCollider
links:                                # optional
  - label: "Bandcamp"
    url: "https://noisk8.bandcamp.com"
bio: "Bio en français…"               # optional
bio_en: "English bio…"                # optional
---
```

- **`collective: true`** → the artist is shown on the **Artists page** (members
  of the TOPLAP Strasbourg community).
  **Without it** (or `false`), the artist does *not* appear on the Artists page,
  but their name is still clickable in events they played (guests, invited
  artists).
- The `name` is what links an artist to events: write it the same way in the
  event's `participants` list.

---

## Resources: tools & software

One file per tool in `src/content/tools/`, e.g. `ibniz.md`. They appear
automatically on the Resources page, sorted alphabetically.

```yaml
---
name: "IBNIZ"                                   # required
category: "other"                               # required: audio | visual | other
community: false                                # optional – true = "made by the community" row
url: "http://viznut.fi/ibniz/"                  # required – must be a full https:// or http:// link
language: "Stack-based (Forth-like)"            # optional – small grey label in the pop-up
description: "Description en français…"         # required
description_en: "English description…"         # optional
---
```

- `category` decides the group: **Audio**, **Visuel / Visual**, **Autre / Other**.
- `community: true` moves it to the "Outils faits par la communauté" row.
- To remove a tool, delete its file.

---

## Media

One file per item in `src/content/media/`. The Media page groups them by type
(videos, photos, audio, links), newest first.

```yaml
---
title: "Atelier & jam session"         # required
title_en: "Workshop & jam session"     # optional
date: 2019-01-01                       # required (approximate is fine)
type: "image"                          # required: video | image | audio | link
url: "/images/media/atelier-jam.webp"  # optional – image path, or a YouTube/SoundCloud/… link
description: "…"                       # required
description_en: "…"                    # optional
---
```

---

## Projects

One file per project in `src/content/projects/`, sorted alphabetically on the
Projects page.

```yaml
---
title: "BACK2THESTREAM"               # required
period: "confinement 2020"            # optional, free text
participants:                         # optional
  - Crash Server
  - Noisk8
links:                                # optional
  - label: "YouTube"
    url: "https://youtube.com/watch?v=…"
description: "…"                      # required
description_en: "…"                   # optional
---
```

---

## Images

1. Put the file in `public/images/`, in the matching folder:
   - `public/images/chaos-labs/` – event posters & photos
   - `public/images/media/` – Media page
   - `public/images/artists/` – artist pictures (create it if needed)
2. Refer to it **starting from `/images/`** — without `public`:
   `cover_image: "/images/chaos-labs/cl12-poster.webp"`.

Tips:

- **File names**: lowercase, no spaces or accents (`cl12-01.webp`, not `CL 12 (1).JPG`).
  Names are case-sensitive once online.
- **Format & size**: prefer `.webp`, about 1600 px wide max for photos, and keep
  each file under ~500 KB. `.jpg` and `.png` work too.
  To convert: `cwebp -q 80 photo.jpg -o photo.webp`, or export as WebP
  from GIMP / Squoosh (squoosh.app).
- Covers are cropped to 16:9 on the agenda cards; the full poster is shown on
  the event page.
- The homepage logo is `public/images/toplap-strasbourg-logo.webp`; the image
  used when the site is shared on social media is `public/images/livecoding-stras.webp`.
  Replace the file (same name) to change them.

---

## Keywords, tags & categories

There are two kinds of "keywords":

**Free keywords — create as many as you want, just type them:**

| Field | Where | Shown as |
|---|---|---|
| `tags` | agenda | small tags on the card and event page |
| `tools` | agenda, artists | tags listing the software used |

There is no list to update: writing a new word in `tags:` creates it. Keep the
spelling consistent (`shadok`, not sometimes `Shadok` and sometimes `Le Shadok`),
lowercase for tags.

**Fixed categories — only these values are accepted**, anything else stops the
site from building:

| Field | Allowed values |
|---|---|
| agenda `type` | `atelier`, `chaos-lab`, `concert`, `jam`, `other` |
| tools `category` | `audio`, `visual`, `other` |
| media `type` | `video`, `image`, `audio`, `link` |

Adding a new value to a fixed category is a code change: add it in
`src/content.config.ts` **and** give it a label in the page that displays it
(`typeLabel` in `src/pages/agenda.astro` and `src/pages/en/agenda.astro`, or
`categoryLabel` in the two `ressources.astro`, or `typeLabel` in the two
`media.astro`).

---

## Links

- **In content files**: links are always a `label` + `url` pair inside `links:`
  (see examples above). Change the `url` to fix a link, the `label` to change the
  button text.
- **Contact page**: the list at the top of `src/pages/contact.astro` **and**
  `src/pages/en/contact.astro` (email, Discord, YouTube, Facebook). Each line has
  a `label`, the displayed `value`, and the `url`.
- **Linkothèque** (friend venues & collectives on the Resources page): the
  `friends` list in `src/pages/ressources.astro` **and** `src/pages/en/ressources.astro`.
- **Documentation row** on the Resources page: the `docItems` list in the same
  two files.
- **Links between pages of the site** start with `/`: `/agenda`, `/contact`,
  `/ressources/charte`. For the English version, add `/en`: `/en/agenda`.
- **Redirects** (when a page moved or was renamed): add a line in `redirects`
  in `astro.config.mjs`:

  ```js
  '/old-address': '/new-address',
  ```

---

## Pages that are written directly in code

These pages are not in `src/content/`: their text is inside `.astro` files.
You can still edit the text safely — **change only the words between the tags**
(`<p>…</p>`, `<h2>…</h2>`, `<li>…</li>`) and leave everything between `<` and `>`
or between `{ }` as it is.

| Page | French | English |
|---|---|---|
| Homepage (hero buttons, intro text) | `src/pages/index.astro` | `src/pages/en/index.astro` |
| Contact | `src/pages/contact.astro` | `src/pages/en/contact.astro` |
| Charter | `src/pages/ressources/charte.astro` | `src/pages/en/ressources/charte.astro` |
| Course (FR only) | `src/pages/ressources/cours-live-coding.astro` | — |
| 404 page | `src/pages/404.astro` | — |

In these files, write `{` and `}` as `&#123;` and `&#125;` (e.g. in code
examples), otherwise they are read as code.

---

## Menu, interface words & translations

`src/i18n/index.ts` holds the short interface texts in both languages: menu
items, page titles, the tagline under the logo, "no upcoming events", etc.
Each line exists once under `fr:` and once under `en:` — change both.

The menu order and entries are in `navLinks` in `src/layouts/Base.astro`.

Dark & light mode colours are the variables at the top of
`src/styles/global.css` (`--bg`, `--fg`, `--accent`, …): the first block is the
dark theme, the two blocks after it are the light theme (keep them identical).

---

## Adding a new page

1. Copy a simple page, e.g. `src/pages/ressources/charte.astro`, to a new name:
   `src/pages/ressources/mon-guide.astro` → URL `/ressources/mon-guide`.
2. Do the same for English under `src/pages/en/…` (fix the `../` in the
   `import` line at the top: one more `../` per folder level).
3. Change the `title` / `description` at the top and the text.
4. Link to it from somewhere — e.g. add an entry to `docItems` on the Resources
   page, or to `navLinks` for the main menu.

---

## Publishing

The site is published on GitHub Pages automatically: **every push to the `main`
branch rebuilds and publishes it** (`.github/workflows/deploy.yml`), usually in
1–2 minutes. Check progress in the repo's *Actions* tab on GitHub.

```sh
npm run build          # check it builds locally first
git add -A
git commit -m "Add Shadok workshop 21 Oct"
git push
```

You can also edit a file directly on github.com (pencil icon) and commit: the
site republishes the same way.

---

## When something breaks

- **Build error mentioning a field** (e.g. `date: Expected date`,
  `type: Invalid enum value`): look at the file and field named in the message —
  usually a missing quote, a wrong date format, a tab instead of spaces, or a
  value not in the allowed list.
- **`url: Invalid url`** in a tool: the link must start with `https://` or `http://`.
- **Image not showing**: check the path starts with `/images/` (not `public/`),
  and that the file name matches exactly, including upper/lower case.
- **Artist name not clickable in an event**: the spelling in `participants`
  doesn't match the artist's `name`, or the artist file has no bio, tools or links.
- **Text I added doesn't appear**: it's probably below the closing `---` of the
  file; move it into `description`.
- **English page shows French**: the `_en` field is missing — add it.
