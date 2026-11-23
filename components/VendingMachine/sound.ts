import { useVending } from "./store";

/**
 * Synthesised machine sounds — no audio files to download. Every call is a no-op while
 * the visitor has sound switched off (the default).
 */
let ctx: AudioContext | null = null;

function audio() {
  if (!useVending.getState().soundOn) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds: number) {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function burst(ac: AudioContext, at: number, { freq, q, gain, decay }: { freq: number; q: number; gain: number; decay: number }) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, decay + 0.05);
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = ac.createGain();
  env.gain.setValueAtTime(gain, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  src.connect(filter).connect(env).connect(ac.destination);
  src.start(at);
  src.stop(at + decay + 0.05);
}

function tone(
  ac: AudioContext,
  at: number,
  { type = "sine", from, to = from, gain, decay }: { type?: OscillatorType; from: number; to?: number; gain: number; decay: number },
) {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + decay);
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  osc.connect(env).connect(ac.destination);
  osc.start(at);
  osc.stop(at + decay + 0.02);
}

export const sfx = {
  /** Soft plastic tick when the pointer finds a carton */
  hover() {
    const ac = audio();
    if (ac) burst(ac, ac.currentTime, { freq: 3200, q: 4, gain: 0.03, decay: 0.03 });
  },
  /** Two-tone selection chirp, like the machine acknowledging the choice */
  select() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, t, { type: "square", from: 1320, gain: 0.04, decay: 0.07 });
    tone(ac, t + 0.08, { type: "square", from: 1760, gain: 0.04, decay: 0.09 });
  },
  /** Button press: a firm click with a short spring rattle */
  press() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    burst(ac, t, { freq: 1800, q: 2, gain: 0.25, decay: 0.05 });
    burst(ac, t + 0.06, { freq: 900, q: 6, gain: 0.06, decay: 0.08 });
    // The vend motor whirring up
    tone(ac, t + 0.12, { type: "sawtooth", from: 70, to: 110, gain: 0.025, decay: 0.45 });
  },
  /** Carton hitting the tray: a low thud with a cardboard slap */
  thunk(strength = 1) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, t, { from: 140, to: 48, gain: 0.5 * strength, decay: 0.22 });
    burst(ac, t, { freq: 420, q: 1.2, gain: 0.35 * strength, decay: 0.12 });
  },
  /** Flap swinging on its hinge */
  flap() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    burst(ac, t, { freq: 2400, q: 8, gain: 0.05, decay: 0.06 });
    burst(ac, t + 0.09, { freq: 1600, q: 8, gain: 0.04, decay: 0.05 });
  },
  /** BUY pressed with nothing chosen: a short low buzz */
  denied() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, t, { type: "square", from: 180, gain: 0.035, decay: 0.12 });
    tone(ac, t + 0.14, { type: "square", from: 150, gain: 0.035, decay: 0.14 });
  },
  /** Lifting the carton out */
  collect() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    burst(ac, t, { freq: 700, q: 0.8, gain: 0.08, decay: 0.25 });
    tone(ac, t + 0.05, { from: 520, to: 880, gain: 0.05, decay: 0.3 });
  },
};
