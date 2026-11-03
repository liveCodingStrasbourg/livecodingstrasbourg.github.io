// Ghosts: visitors on the page at the same moment see each other and play together.
// Peer-to-peer (WebRTC via public Nostr relays); nothing is stored anywhere.
// Shared by /lab/fantomes and /en/lab/fantomes: texts come from #gh-root[data-i18n].
import { joinRoom, selfId } from 'https://esm.run/trystero@0.26.0';

const root = document.getElementById('gh-root');
const T = JSON.parse(root.dataset.i18n);
const $ = id => document.getElementById(id);

const CELL = 10;                                   // pixel grid, like the logo
const SCALE = [0, 2, 4, 7, 9];                     // pentatonic
const STEP_MS = 60000 / 112 / 2;                   // eighth notes at 112 BPM, on the shared clock
const INSTRUMENTS = ['triangle', 'square', 'sawtooth', 'sine'];
const BUBBLE_MS = 8000, SAY_MAX = 80, SAY_GAP_MS = 2000;

const canvas = $('gh-canvas');
const ctx = canvas.getContext('2d');
const ghosts = new Map();                          // peerId -> {x, y, energy, trail, inst, bubble, lastSay, colour}
let audio = null, master = null, room = null, move = null, hi = null, say = null, instrument = 0;

const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const resize = () => {
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * devicePixelRatio);
  canvas.height = Math.round(r.height * devicePixelRatio);
};
addEventListener('resize', resize);
resize();

const midiOf = x => {
  const step = Math.min(9, Math.floor(x * 10));
  return 48 + 12 * Math.floor(step / 5) + SCALE[step % 5];
};

const ghost = (id, isSelf = false) => {
  if (!ghosts.has(id)) {
    ghosts.set(id, {
      x: 0.5, y: 0.5, energy: 0, trail: [], isSelf, inst: 0, bubble: null, lastSay: 0,
      colour: isSelf ? '#FFED00' : `hsl(${hash(id) % 360} 85% 65%)`,
      offset: hash(id) % 2,
    });
  }
  return ghosts.get(id);
};

const place = (g, x, y) => {
  g.energy = Math.min(1, g.energy + Math.hypot(x - g.x, y - g.y) * 6);
  g.x = x; g.y = y;
  g.trail.push({ x, y, life: 1 });
  if (g.trail.length > 24) g.trail.shift();
};

// --- sound: plucks on a clock every browser shares (wall clock), so voices land together ---
const pluck = (g, when) => {
  const osc = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const env = audio.createGain();
  osc.type = INSTRUMENTS[g.inst] ?? 'triangle';
  osc.frequency.value = 440 * 2 ** ((midiOf(g.x) - 69) / 12);
  filter.type = 'lowpass';
  filter.frequency.value = 300 + (1 - g.y) * 3500;
  const peak = (g.isSelf ? 0.22 : 0.13) * (0.4 + g.energy * 0.6);
  env.gain.setValueAtTime(0.0001, when);
  env.gain.exponentialRampToValueAtTime(peak, when + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, when + 0.35);
  osc.connect(filter).connect(env).connect(master);
  osc.start(when);
  osc.stop(when + 0.4);
};

let lastStep = 0;
const clock = () => {
  if (!audio) return;
  const nowMs = Date.now();
  const step = Math.floor(nowMs / STEP_MS);
  if (step === lastStep) return;
  lastStep = step;
  const when = audio.currentTime + Math.max(0, (step + 1) * STEP_MS - nowMs) / 1000;
  for (const g of ghosts.values()) {
    // Quiet ghosts play every other step (offset per ghost); moving ones fill the gaps.
    if (g.energy > 0.5 || (g.energy > 0.06 && (step + g.offset) % 2 === 0)) pluck(g, when);
  }
};
setInterval(clock, 25);

const updateCount = () => {
  const others = ghosts.size - 1;
  $('gh-count').textContent = !room ? '' : others <= 0 ? T.alone : others === 1 ? T.one : T.many.replace('{n}', others);
};

// --- text bubbles: drawn on the canvas and in a short list that forgets ---
const logLine = (g, text, mine) => {
  const li = document.createElement('li');
  li.textContent = (mine ? T.you + ' : ' : '') + text;
  li.style.color = mine ? '' : g.colour;
  $('gh-log').append(li);
  setTimeout(() => li.remove(), BUBBLE_MS);
};
const showSay = (g, text, mine = false) => {
  g.bubble = { text, until: performance.now() + BUBBLE_MS };
  logLine(g, text, mine);
};

const draw = () => {
  const w = canvas.width, h = canvas.height, c = CELL * devicePixelRatio;
  ctx.clearRect(0, 0, w, h);
  const now = performance.now();
  const ink = css('--fg') || '#fff';
  for (const g of ghosts.values()) {
    g.energy *= 0.965;
    for (const p of g.trail) {
      p.life *= 0.93;
      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle = g.colour;
      ctx.fillRect(Math.floor(p.x * w / c) * c, Math.floor(p.y * h / c) * c, c, c);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = g.colour;
    const s = c * (2 + Math.round(g.energy * 2));
    const px = Math.floor(g.x * w / c) * c, py = Math.floor(g.y * h / c) * c;
    ctx.fillRect(px - s / 2, py - s / 2, s, s);
    if (g.bubble && now < g.bubble.until) {
      ctx.font = `${13 * devicePixelRatio}px "Courier New", monospace`;
      ctx.fillStyle = ink;
      ctx.globalAlpha = Math.min(1, (g.bubble.until - now) / 1500);
      const tw = ctx.measureText(g.bubble.text).width;
      const tx = Math.min(w - tw - 4, Math.max(4, px - tw / 2));
      ctx.fillText(g.bubble.text, tx, Math.max(16 * devicePixelRatio, py - s));
      ctx.globalAlpha = 1;
    }
  }
  requestAnimationFrame(draw);
};
requestAnimationFrame(draw);

// --- input --------------------------------------------------------------------------
let last = 0;
const onPointer = e => {
  if (!room) return;
  const r = canvas.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  place(ghost(selfId, true), x, y);
  const now = performance.now();
  if (now - last > 50) { last = now; move.send([x, y]); }
};
canvas.addEventListener('pointermove', onPointer);
canvas.addEventListener('pointerdown', onPointer);

$('gh-instrument').addEventListener('change', e => {
  instrument = Number(e.target.value) || 0;
  ghost(selfId, true).inst = instrument;
  hi?.send(instrument);
});

let lastSent = 0;
$('gh-say').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('gh-text');
  const text = input.value.trim().slice(0, SAY_MAX);
  const now = performance.now();
  if (!text || !room || now - lastSent < SAY_GAP_MS) return;
  lastSent = now;
  say.send(text);
  showSay(ghost(selfId, true), text, true);
  input.value = '';
});

// --- rooms: #name in the address gives a private room ------------------------------------
const roomName = decodeURIComponent(location.hash.slice(1)).replace(/[^\w-]/g, '').slice(0, 40);
if (roomName) $('gh-room').textContent = T.room.replace('{name}', roomName);

$('gh-new-room').addEventListener('click', () => {
  const name = 'salle-' + Math.random().toString(36).slice(2, 8);
  location.hash = name;
  location.reload();
});

$('gh-enter').addEventListener('click', e => {
  e.currentTarget.hidden = true;
  audio = new AudioContext();
  master = audio.createDynamicsCompressor();
  master.connect(audio.destination);
  ghost(selfId, true);
  room = joinRoom({ appId: 'toplap-strasbourg-site' }, roomName ? `fantomes-${roomName}` : 'fantomes');
  move = room.makeAction('move');
  hi = room.makeAction('hi');
  say = room.makeAction('say');
  move.onMessage = (data, { peerId }) => {
    if (Array.isArray(data) && data.length === 2 && data.every(n => typeof n === 'number' && n >= 0 && n <= 1)) {
      place(ghost(peerId), data[0], data[1]);
    }
  };
  hi.onMessage = (data, { peerId }) => {
    if (Number.isInteger(data) && data >= 0 && data < INSTRUMENTS.length) ghost(peerId).inst = data;
  };
  say.onMessage = (data, { peerId }) => {
    const g = ghost(peerId), now = performance.now();
    if (typeof data !== 'string' || now - g.lastSay < SAY_GAP_MS / 2) return;
    const text = data.trim().slice(0, SAY_MAX);
    if (!text) return;
    g.lastSay = now;
    showSay(g, text);
  };
  room.onPeerJoin = peerId => { ghost(peerId); hi.send(instrument, { target: peerId }); updateCount(); };
  room.onPeerLeave = peerId => { ghosts.delete(peerId); updateCount(); };
  $('gh-say').hidden = false;
  updateCount();
});

addEventListener('pagehide', () => room?.leave());
