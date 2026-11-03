// An event stays "upcoming" through the whole of its day, in Strasbourg time.
// Dates are compared as YYYY-MM-DD so the build machine's timezone doesn't matter.
const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());

export const isUpcoming = (date: Date) => date.toISOString().slice(0, 10) >= today();
