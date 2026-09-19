/**
 * Web Audio API Synthesizer for Snakes and Ladder Game
 * Generates all sound effects dynamically without external audio files.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playStepSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

export function playRollSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Sequence of quick dice clicks
  for (let i = 0; i < 7; i++) {
    const clickTime = now + i * 0.08 + Math.random() * 0.03;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = i % 2 === 0 ? 'triangle' : 'square';
    osc.frequency.setValueAtTime(300 + Math.random() * 400, clickTime);

    gain.gain.setValueAtTime(0.18, clickTime);
    gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(clickTime);
    osc.stop(clickTime + 0.04);
  }
}

export function playLadderSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Ascending cheerful chromatic ladder notes
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.07;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.25, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.18);
  });
}

export function playSnakeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Descending slide with sad wobble
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();

  lfo.frequency.setValueAtTime(14, now); // vibrato wobble
  lfoGain.gain.setValueAtTime(25, now);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(620, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.7);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  osc.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc.start(now);
  lfo.stop(now + 0.7);
  osc.stop(now + 0.7);
}

export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Harmonious celebratory chime: C5, E5, G5, C6, E6
  const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.3, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.45);
  });
}

export function playWrongSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Distinct low dual buzzer ("bzz-bzz")
  [0, 0.16].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const buzzTime = now + offset;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, buzzTime);
    osc.frequency.linearRampToValueAtTime(110, buzzTime + 0.12);

    gain.gain.setValueAtTime(0.28, buzzTime);
    gain.gain.exponentialRampToValueAtTime(0.001, buzzTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(buzzTime);
    osc.stop(buzzTime + 0.12);
  });
}

export function playTrophySound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Magical shimmer
  [880, 1174.66, 1760, 2093].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + i * 0.09;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.25, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.5);
  });
}

export function playBlockedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Muffled double knock
  [0, 0.14].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const knockTime = now + offset;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, knockTime);

    gain.gain.setValueAtTime(0.2, knockTime);
    gain.gain.exponentialRampToValueAtTime(0.001, knockTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(knockTime);
    osc.stop(knockTime + 0.08);
  });
}

export function playSaveSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

export function playVictorySound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Fanfare triumphant melody
  const notes = [
    { f: 523.25, d: 0.18, t: 0 },
    { f: 523.25, d: 0.18, t: 0.2 },
    { f: 523.25, d: 0.18, t: 0.4 },
    { f: 659.25, d: 0.35, t: 0.6 },
    { f: 587.33, d: 0.18, t: 1.0 },
    { f: 659.25, d: 0.18, t: 1.2 },
    { f: 783.99, d: 0.6,  t: 1.45 },
    { f: 1046.5, d: 0.9,  t: 2.1 }
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + n.t;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.f, noteTime);

    gain.gain.setValueAtTime(0.3, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + n.d);
  });
}
