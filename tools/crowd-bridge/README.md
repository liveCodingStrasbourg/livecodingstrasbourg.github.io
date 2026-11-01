# Crowd bridge

Sends the audience values from the Chaos Lab live room (`/lab/scene`) to your
live coding software as OSC.

```sh
cd tools/crowd-bridge
npm install
npm start          # ws://127.0.0.1:57321 -> OSC 127.0.0.1:57120 (SuperCollider)
```

Then on `/lab/scene`, tick **Envoyer au pont OSC**.

Messages (all floats, every 100 ms):

| Address | Value |
|---|---|
| `/crowd` | count x y tiltX tiltY energy spread |
| `/crowd/count` | number of phones |
| `/crowd/x`, `/crowd/y` | average finger position, 0–1 |
| `/crowd/tiltX`, `/crowd/tiltY` | average phone tilt, 0–1 (0.5 if nobody tilts) |
| `/crowd/energy` | how much people move, 0–1 |
| `/crowd/spread` | how scattered they are, 0–~0.7 |

SuperCollider example (FoxDot runs on SuperCollider too):

```supercollider
~crowd = ();
OSCdef(\crowd, { |msg|
  #~crowd[\count], ~crowd[\x], ~crowd[\y], ~crowd[\tiltX], ~crowd[\tiltY], ~crowd[\energy], ~crowd[\spread] = msg[1..];
}, '/crowd');
// e.g. Ndef(\pad).set(\cutoff, ~crowd[\y].linexp(0, 1, 200, 8000));
```

Other targets: `OSC_HOST=… OSC_PORT=… npm start` (TouchDesigner, Pure Data, vvvv…).
In the browser (Hydra / Strudel running on the same site), the values are also in
`window.crowd` and on `new BroadcastChannel('toplap-crowd')`.
