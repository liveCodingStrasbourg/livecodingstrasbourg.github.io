// Crowd bridge: /lab/scene (browser) --WebSocket--> this script --OSC/UDP--> SuperCollider & co.
//
//   cd tools/crowd-bridge && npm install && npm start
//   OSC_HOST=127.0.0.1 OSC_PORT=57120 WS_PORT=57321 npm start
//
// Every 100 ms it sends, as floats:
//   /crowd  count x y tiltX tiltY energy spread
//   /crowd/<name> <value>   (one message per value)
import dgram from 'node:dgram';
import { WebSocketServer } from 'ws';

const WS_PORT = Number(process.env.WS_PORT ?? 57321);
const OSC_HOST = process.env.OSC_HOST ?? '127.0.0.1';
const OSC_PORT = Number(process.env.OSC_PORT ?? 57120);
const KEYS = ['count', 'x', 'y', 'tiltX', 'tiltY', 'energy', 'spread'];

const pad4 = buf => Buffer.concat([buf, Buffer.alloc((4 - (buf.length % 4)) || 4)]);
const oscString = s => pad4(Buffer.from(s, 'ascii'));
const oscMessage = (address, floats) => {
  const args = Buffer.alloc(4 * floats.length);
  floats.forEach((f, i) => args.writeFloatBE(f, 4 * i));
  return Buffer.concat([oscString(address), oscString(',' + 'f'.repeat(floats.length)), args]);
};

const udp = dgram.createSocket('udp4');
const send = msg => udp.send(msg, OSC_PORT, OSC_HOST);

const wss = new WebSocketServer({ host: '127.0.0.1', port: WS_PORT });
wss.on('connection', socket => {
  console.log('scene connected');
  socket.on('message', raw => {
    let c;
    try { c = JSON.parse(raw); } catch { return; }
    const values = KEYS.map(k => Number(c?.[k]) || 0);
    send(oscMessage('/crowd', values));
    KEYS.forEach((k, i) => send(oscMessage(`/crowd/${k}`, [values[i]])));
  });
  socket.on('close', () => console.log('scene disconnected'));
});

console.log(`crowd bridge: ws://127.0.0.1:${WS_PORT} -> osc://${OSC_HOST}:${OSC_PORT}`);
