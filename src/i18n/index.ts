export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  fr: {
    'nav.home': 'Accueil',
    'nav.agenda': 'Agenda',
    'nav.artists': 'Artistes',
    'nav.tools': 'Ressources',
    'nav.projects': 'Projets',
    'nav.media': 'Médias',
    'site.tagline': 'Live coding & arts numériques à Strasbourg',
    'agenda.title': 'Agenda',
    'agenda.empty': 'Aucun événement à venir pour l\'instant.',
    'artists.title': 'Artistes',
    'tools.title': 'Ressources',
    'tools.subtitle': 'Logiciels, documentation et ressources pour le live coding',
    'tools.documentation': 'Documentation',
    'tools.linkotheque': 'Linkothèque',
    'tools.linkotheque.subtitle': 'Le réseau ami à Strasbourg : lieux, hackerspaces et collectifs proches de nos valeurs.',
    'media.title': 'Médias',
    'projects.title': 'Projets',
    'projects.subtitle': 'Projets menés par la communauté, passés et présents',
    'lang.switch': 'English',
  },
  en: {
    'nav.home': 'Home',
    'nav.agenda': 'Agenda',
    'nav.artists': 'Artists',
    'nav.tools': 'Resources',
    'nav.projects': 'Projects',
    'nav.media': 'Media',
    'site.tagline': 'Live coding & digital arts in Strasbourg',
    'agenda.title': 'Agenda',
    'agenda.empty': 'No upcoming events for now.',
    'artists.title': 'Artists',
    'tools.title': 'Resources',
    'tools.subtitle': 'Software, documentation and resources for live coding',
    'tools.documentation': 'Documentation',
    'tools.linkotheque': 'Link directory',
    'tools.linkotheque.subtitle': "The friend network in Strasbourg: venues, hackerspaces and collectives close to our values.",
    'media.title': 'Media',
    'projects.title': 'Projects',
    'projects.subtitle': 'Community-led projects, past and present',
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
