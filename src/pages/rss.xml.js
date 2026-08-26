import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const events = await getCollection('agenda');
  const sorted = events.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'TOPLAP Strasbourg — Agenda',
    description: 'Ateliers, Chaos Labs et évènements de TOPLAP Strasbourg.',
    site: context.site,
    items: sorted.map(event => ({
      title: event.data.title,
      description: event.data.description,
      pubDate: new Date(event.data.date),
      link: `/agenda/${event.id}/`,
    })),
    customData: `<language>fr</language>`,
  });
}
