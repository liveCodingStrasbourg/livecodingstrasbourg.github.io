// Short, flyer-friendly addresses for events: /chaos-lab-12 → /agenda/2026-07-chaos-lab-12/.
// An event gets `short:` from its frontmatter, or else its file name without the date,
// as long as that name is unique and not already a page of the site.
import { getCollection } from 'astro:content';
import { readdirSync } from 'node:fs';

const RESERVED = new Set([
  'agenda', 'artists', 'contact', 'media', 'projects', 'ressources', 'lab', 'en', 'tools',
  'chaos-labs', 'chaoslab', 'chaoslab_en', 'chaoslab_backup', 'chaos-lab-vii', 'downloads',
  'images', 'videos', 'rss', 'search', 'recherche', '404',
  ...readdirSync('public').map(f => f.replace(/\.[^.]+$/, '').toLowerCase()),
]);

export async function shortLinks() {
  const events = await getCollection('agenda');
  const derived = (id: string) => id.replace(/^\d{4}-\d{2}(-\d{2})?-/, '');
  const count = new Map<string, number>();
  for (const e of events) if (!e.data.short) count.set(derived(e.id), (count.get(derived(e.id)) ?? 0) + 1);

  const map = new Map<string, string>(); // short → event id
  for (const e of events) {
    const short = e.data.short ?? (count.get(derived(e.id)) === 1 ? derived(e.id) : undefined);
    if (!short || RESERVED.has(short) || map.has(short)) continue;
    map.set(short, e.id);
  }
  return map;
}

export async function shortLinkFor(id: string) {
  for (const [short, eventId] of await shortLinks()) if (eventId === id) return short;
}
