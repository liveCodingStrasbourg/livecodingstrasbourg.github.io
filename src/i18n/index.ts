export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  fr: {
    'nav.home': 'Accueil',
    'nav.agenda': 'Agenda',
    'nav.chaos-labs': 'Chaos Labs',
    'nav.artists': 'Artistes',
    'nav.tools': 'Outils',
    'site.tagline': 'Live coding & arts numériques à Strasbourg',
    'agenda.title': 'Agenda',
    'agenda.empty': 'Aucun événement à venir pour l\'instant.',
    'chaos-labs.title': 'Archives Chaos Labs',
    'chaos-labs.subtitle': 'Sessions de live coding improvisées',
    'artists.title': 'Artistes',
    'tools.title': 'Outils',
    'tools.subtitle': 'Logiciels et ressources pour le live coding',
    'media.title': 'Médias',
    'lang.switch': 'English',
  },
  en: {
    'nav.home': 'Home',
    'nav.agenda': 'Agenda',
    'nav.chaos-labs': 'Chaos Labs',
    'nav.artists': 'Artists',
    'nav.tools': 'Tools',
    'site.tagline': 'Live coding & digital arts in Strasbourg',
    'agenda.title': 'Agenda',
    'agenda.empty': 'No upcoming events for now.',
    'chaos-labs.title': 'Chaos Labs Archive',
    'chaos-labs.subtitle': 'Improvised live coding sessions',
    'artists.title': 'Artists',
    'tools.title': 'Tools',
    'tools.subtitle': 'Software and resources for live coding',
    'media.title': 'Media',
    'lang.switch': 'Français',
  },
} as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return 'fr';
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof lang]) {
    return ui[lang][key];
  };
}

export function getLocalePath(lang: Lang, path: string) {
  if (lang === 'fr') return path;
  return `/en${path}`;
}
