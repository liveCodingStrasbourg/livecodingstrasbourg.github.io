// Calendar feed (iCalendar) of the agenda: subscribe once in Google Calendar,
// Apple Calendar, Thunderbird or a phone, and new events show up by themselves.
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

// "18h", "17h00", "20h30", "21h++" → [hours, minutes]
const parseTime = (s?: string) => {
  const m = s?.match(/(\d{1,2})\s*h\s*(\d{2})?/i);
  return m ? [Number(m[1]), Number(m[2] ?? 0)] as const : undefined;
};

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const stamp = (d: Date) => `${ymd(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// Lines longer than 75 bytes are folded (RFC 5545), without splitting a UTF-8 character.
const fold = (line: string) => {
  const out: string[] = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join('\r\n ');
};

const VTIMEZONE = [
  'BEGIN:VTIMEZONE', 'TZID:Europe/Paris',
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST',
  'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET',
  'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
  'END:VTIMEZONE',
];

export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://livecodingstrasbourg.github.io');
  const now = stamp(new Date());
  const events = (await getCollection('agenda')).sort((a, b) => +a.data.date - +b.data.date);

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TOPLAP Strasbourg//Agenda//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:TOPLAP Strasbourg', 'X-WR-TIMEZONE:Europe/Paris', 'X-PUBLISHED-TTL:PT12H',
    ...VTIMEZONE,
  ];

  for (const ev of events) {
    const d = ev.data;
    const day = ymd(d.date);
    const times = (d.duration ?? '').match(/\d{1,2}\s*h\s*\d{0,2}/gi) ?? [];
    const start = parseTime(d.time_start) ?? parseTime(times[0]);
    const end = parseTime(d.time_end) ?? parseTime(times[1]);
    const url = new URL(`/agenda/${ev.id}/`, site).toString();

    lines.push('BEGIN:VEVENT', `UID:${ev.id}@livecodingstrasbourg.github.io`, `DTSTAMP:${now}`);
    if (start) {
      // No end time given: assume three hours. Ends past midnight roll to the next day.
      const [eh, em] = end ?? [start[0] + 3, start[1]];
      const endDay = new Date(d.date);
      if (eh * 60 + em <= start[0] * 60 + start[1] || eh >= 24) endDay.setUTCDate(endDay.getUTCDate() + 1);
      lines.push(`DTSTART;TZID=Europe/Paris:${day}T${pad(start[0])}${pad(start[1])}00`);
      lines.push(`DTEND;TZID=Europe/Paris:${ymd(endDay)}T${pad(eh % 24)}${pad(em)}00`);
    } else {
      const next = new Date(d.date);
      next.setUTCDate(next.getUTCDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${ymd(next)}`);
    }
    const summary = d.subtitle ? `${d.title} — ${d.subtitle}` : d.title;
    lines.push(`SUMMARY:${escape(summary)}`);
    if (d.location) lines.push(`LOCATION:${escape(d.location)}`);
    lines.push(`DESCRIPTION:${escape(`${d.description}\n\n${url}`)}`, `URL:${url}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');

  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}
