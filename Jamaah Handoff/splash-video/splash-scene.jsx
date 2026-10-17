const SPLASH_THEMES = {
  cedar: { bg: 'oklch(0.3 0.05 185)', ink: 'oklch(0.955 0.018 75)', acc: 'oklch(0.64 0.135 41)' },
  dark: { bg: 'oklch(0.19 0.022 195)', ink: 'oklch(0.93 0.02 75)', acc: 'oklch(0.7 0.14 42)' },
  cream: { bg: 'oklch(0.955 0.018 75)', ink: 'oklch(0.3 0.05 185)', acc: 'oklch(0.62 0.13 40)' },
};
const MOTION = { enter: Easing.easeOutCubic, settle: Easing.easeOutBack, soft: Easing.easeInOutSine };
const W = 1080, H = 1920;
const FW = 72, FH = 112.5, GAP = 32.4, RGAP = 28.8;
const ROW_W = FW * 4 + GAP * 3, COL0 = W / 2 - ROW_W / 2;
const TOP = 650, ROW_Y = [TOP, TOP + FH + RGAP, TOP + 2 * (FH + RGAP)];
const NAME_Y = ROW_Y[2] + FH + 27;
const START_X = -120;
const STEPS = 6;
// RTL order: index 0 = rightmost. The last slot of row 3 (leftmost, COL0) belongs to "you".
const SEATS = [
  { x: W / 2 - FW / 2, y: ROW_Y[0], order: 0 },
  ...[3, 2, 1, 0].map((c, i) => ({ x: COL0 + c * (FW + GAP), y: ROW_Y[1], order: 1 + i })),
  ...[3, 2, 1].map((c, i) => ({ x: COL0 + c * (FW + GAP), y: ROW_Y[2], order: 5 + i })),
];
const lerp = (a, b, t) => a + (b - a) * t;
const tw = (T, from, to, start, end, ease) => animate({ from, to, start, end, ease })(T);
const figShape = { position: 'absolute', width: FW, height: FH, borderRadius: `${FW / 2}px ${FW / 2}px ${FW * 0.2}px ${FW * 0.2}px`, transformOrigin: '50% 100%' };

function Rows({ T, CUES, th, dip }) {
  return SEATS.map((s, i) => {
    const st = 0.05 + s.order * 0.07;
    const o = tw(T, 0, 1, st, st + 0.45, MOTION.enter);
    const y = tw(T, 22, 0, st, st + 0.55, MOTION.enter);
    return <div key={i} style={{ ...figShape, left: s.x, top: s.y, background: th.ink, opacity: o, transform: `translateY(${y}px) scaleY(${dip})` }} />;
  });
}

function EmptySeat({ T, CUES, th }) {
  const inO = tw(T, 0, 0.32, 0.5, 0.9, MOTION.soft);
  const outO = tw(T, 1, 0, CUES.Settle - 0.5, CUES.Settle, MOTION.soft);
  return <div style={{ ...figShape, left: COL0, top: ROW_Y[2], boxSizing: 'border-box', border: `3px solid ${th.ink}`, opacity: inO * outO }} />;
}

function Walker({ T, CUES, th, dip }) {
  const dur = CUES.Settle - CUES.Walk;
  const p = clamp((T - CUES.Walk) / dur, 0, 1);
  const u = 1 - (1 - p) * (1 - p);
  const x = lerp(START_X, COL0, u);
  const phi = u * STEPS * Math.PI;
  const walking = p > 0 && p < 1 ? 1 : 0;
  const bob = -Math.abs(Math.sin(phi)) * 18 * walking;
  const rot = 4 * Math.sin(phi) * walking;
  const contact = walking * 0.06 * Math.pow(1 - Math.abs(Math.sin(phi)), 6);
  const sY = tw(T, 0.86, 1, CUES.Settle, CUES.Settle + 0.55, MOTION.settle);
  const sX = tw(T, 1.08, 1, CUES.Settle, CUES.Settle + 0.55, MOTION.settle);
  const settling = T >= CUES.Settle;
  const scaleY = (settling ? sY : 1 - contact) * dip;
  const scaleX = settling ? sX : 1 + contact * 0.7;
  return <div style={{ ...figShape, left: x, top: ROW_Y[2], background: th.acc, transform: `translateY(${bob}px) rotate(${rot}deg) scale(${scaleX}, ${scaleY})` }} />;
}

function Takbir({ T, CUES, th }) {
  const t0 = CUES.Takbir;
  const o = tw(T, 0, 1, t0, t0 + 0.8, MOTION.soft) * tw(T, 1, 0, CUES.Name + 0.2, CUES.Name + 0.9, MOTION.soft);
  const y = tw(T, 18, 0, t0, t0 + 0.9, MOTION.enter);
  const cx = W / 2, cy = ROW_Y[0] + FH * 0.45;
  const rings = [0, 0.55].map((d, i) => {
    const r = tw(T, 40, 380, t0 + d, t0 + d + 2.0, MOTION.enter);
    const ro = T < t0 + d ? 0 : tw(T, 0.28, 0, t0 + d, t0 + d + 2.0, MOTION.soft);
    return <div key={i} style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `2px solid ${th.ink}`, boxSizing: 'border-box', opacity: ro }} />;
  });
  return (
    <React.Fragment>
      {rings}
      <div dir="rtl" style={{ position: 'absolute', left: 0, width: W, top: ROW_Y[0] - 120, textAlign: 'center', fontFamily: "'Reem Kufi', sans-serif", fontWeight: 600, fontSize: 56, lineHeight: 1.3, color: th.ink, opacity: o * 0.9, transform: `translateY(${y}px)` }}>{'الل\u034Fه أكبر'}</div>
    </React.Fragment>
  );
}

function Name({ T, CUES, th }) {
  const t0 = CUES.Name;
  const y = tw(T, H - NAME_Y + 40, 0, t0, t0 + 1.25, MOTION.enter);
  const o = tw(T, 0, 1, t0, t0 + 0.55, MOTION.soft);
  const lo = tw(T, 0, 1, t0 + 0.9, t0 + 1.6, MOTION.soft);
  return (
    <React.Fragment>
      <div dir="rtl" style={{ position: 'absolute', left: 0, width: W, top: NAME_Y, textAlign: 'center', fontFamily: "'Reem Kufi', sans-serif", fontWeight: 700, fontSize: 171, lineHeight: 1.15, color: th.ink, opacity: o, transform: `translateY(${y}px)` }}>جماعة</div>
      <div style={{ position: 'absolute', left: 0, width: W, bottom: 200, textAlign: 'center', fontFamily: "'Readex Pro', sans-serif", fontWeight: 500, fontSize: 34, letterSpacing: '0.32em', paddingLeft: '0.32em', boxSizing: 'border-box', color: th.acc, opacity: lo }}>JAMA'AH</div>
    </React.Fragment>
  );
}

function SplashPiece({ tweaks }) {
  const { T, CUES, authoredTotal } = useComposition();
  const th = SPLASH_THEMES[tweaks.theme] || SPLASH_THEMES.cedar;
  const q = clamp((T - (CUES.Takbir + 0.3)) / 0.7, 0, 1);
  const dip = 1 - 0.035 * Math.sin(Math.PI * q);
  const cam = 1 + 0.035 * MOTION.soft(clamp(T / authoredTotal, 0, 1));
  return (
    <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: th.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: `50% ${TOP + 300}px` }}>
        <Takbir T={T} CUES={CUES} th={th} />
        <EmptySeat T={T} CUES={CUES} th={th} />
        <Rows T={T} CUES={CUES} th={th} dip={dip} />
        <Walker T={T} CUES={CUES} th={th} dip={dip} />
        <Name T={T} CUES={CUES} th={th} />
      </div>
    </div>
  );
}

function JamaahSplash() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || { motionEditor: true, theme: 'cedar', sound: true });
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={(SPLASH_THEMES[t.theme] || SPLASH_THEMES.cedar).bg}>
        <SplashPiece tweaks={t} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Splash" />
        <TweakRadio label="Theme" value={t.theme} options={['cedar', 'dark', 'cream']} onChange={v => setTweak('theme', v)} />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.JamaahSplash = JamaahSplash;
