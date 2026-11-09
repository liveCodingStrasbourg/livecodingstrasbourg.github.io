// Artists get their own page only when there's something more to show than the
// card (for now: videos). Without it, the card stays a plain, non-clickable card.
export const hasArtistPage = (artist: { data: { videos?: string[] } }) => (artist.data.videos?.length ?? 0) > 0;

export const artistPagePath = (id: string, lang: string) => `${lang === 'en' ? '/en' : ''}/artists/${id}/`;

// Same matching as event participants (case, spaces and "(…)" ignored).
export const artistKey = (name: string) => name.replace(/\s*\(.*?\)\s*/g, '').toLowerCase().replace(/\s+/g, '');
