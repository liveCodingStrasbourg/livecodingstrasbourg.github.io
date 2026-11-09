// Search index for the header search box: events, artists, tools, projects and
// main pages, in both languages. Fetched by the browser the first time someone
// focuses the search field.
import { getCollection } from 'astro:content';

type Entry = { k: string; t: string; te?: string; d: string; de?: string; u: string; ue?: string; y?: string; s?: string };

const short = (s = '', n = 140) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
const key = (s: string) => s.replace(/\s*\(.*?\)\s*/g, '').toLowerCase().replace(/\s+/g, '');

export async function GET() {
  const [events, artists, tools, projects] = await Promise.all(
    ['agenda', 'artists', 'tools', 'projects'].map(c => getCollection(c as 'agenda')),
  ) as [any[], any[], any[], any[]];
  const entries: Entry[] = [];

  const sorted = [...events].sort((a, b) => +b.data.date - +a.data.date);
  for (const e of sorted) {
    const d = e.data;
    entries.push({
      k: 'event', y: d.date.toISOString().slice(0, 10),
      t: d.subtitle ? `${d.title} — ${d.subtitle}` : d.title,
      te: d.title_en ? (d.subtitle_en ? `${d.title_en} — ${d.subtitle_en}` : d.title_en) : undefined,
      d: short([d.location, d.participants?.join(', '), d.tools?.join(', '), d.description].filter(Boolean).join(' · '), 400),
      de: d.description_en ? short([d.location, d.participants?.join(', '), d.tools?.join(', '), d.description_en].filter(Boolean).join(' · '), 400) : undefined,
      u: `/agenda/${e.id}/`, ue: `/en/agenda/${e.id}/`,
      // Address words too, so "chaos lab 12" finds "Chaos Lab XII".
      s: [e.id.replace(/-/g, ' '), d.short?.replace(/-/g, ' ')].filter(Boolean).join(' '),
    });
  }

  for (const a of artists) {
    const d = a.data;
    // Community members have a card on the Artists page; guests link to their latest event.
    const latest = sorted.find(e => e.data.participants?.some((p: string) => key(p) === key(d.name)));
    const u = d.collective ? `/artists/#${a.id}` : latest && `/agenda/${latest.id}/`;
    if (!u) continue;
    entries.push({
      k: 'artist', t: d.name,
      d: short([d.bio, d.tools?.join(', ')].filter(Boolean).join(' · '), 300),
      de: d.bio_en ? short([d.bio_en, d.tools?.join(', ')].filter(Boolean).join(' · '), 300) : undefined,
      u, ue: d.collective ? `/en/artists/#${a.id}` : `/en${u}`,
    });
  }

  for (const t of tools) {
    entries.push({ k: 'tool', t: t.data.name, d: short([t.data.language, t.data.description].filter(Boolean).join(' · ')), de: t.data.description_en ? short([t.data.language, t.data.description_en].filter(Boolean).join(' · ')) : undefined, u: t.data.url });
  }

  for (const p of projects) {
    entries.push({ k: 'project', t: p.data.title, d: short(p.data.description, 300), de: p.data.description_en ? short(p.data.description_en, 300) : undefined, u: `/projects/#${p.id}`, ue: `/en/projects/#${p.id}` });
  }

  entries.push(
    { k: 'page', t: 'Charte TOPLAP Strasbourg', te: 'TOPLAP Strasbourg charter', d: 'Valeurs et règles de vie : ouverture, partage, expérimentation, communauté, consentement.', de: 'Values and ground rules: openness, sharing, experimentation, community, consent.', u: '/ressources/charte/', ue: '/en/ressources/charte/' },
    { k: 'page', t: 'Introduction au live coding (cours)', d: 'Support de cours : définitions, histoire, outils, scène strasbourgeoise, glitch art, feedback, Pure Data, culture libre. PDF.', u: '/ressources/cours-live-coding/' },
    { k: 'page', t: 'Contact', d: 'Email, Discord, Mobilizon, Instagram, YouTube.', u: '/contact/', ue: '/en/contact/' },
    { k: 'page', t: 'Médias — logo à télécharger', te: 'Media — logo downloads', d: 'Photos, vidéos et logo TOPLAP Strasbourg (SVG, PNG).', de: 'Photos, videos and the TOPLAP Strasbourg logo (SVG, PNG).', u: '/media/', ue: '/en/media/' },
    { k: 'page', t: 'Calendrier (.ics)', te: 'Calendar (.ics)', d: "S'abonner à l'agenda dans son calendrier.", de: 'Subscribe to the agenda in your calendar.', u: '/agenda/', ue: '/en/agenda/' },
  );

  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
}
