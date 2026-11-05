// Twen, the seal plush from twen.png, above the prompt.
// Always smiling, eyes closed.
// Idle: now and then leans into the screen Rock-eyebrow style, one eye closer, then the other.
// While a turn runs: raises both round hands onto the top of his head, bear-ear style, under falling stars; drops them when it ends.
// Or, `/twen busy guitar`: steps back a little, lifts a Tiffany-green Explorer from below the screen and shreds it under fireworks.
// `/twen busy guitar-3d` is the same, swaying into the screen Rock-style while he plays, one side closer, then the other, nodding forward on the beat; now and then he leans right up to the screen for a bar.
// `/twen busy finding`: shades his brow with one hand and swings the head nearly all the way round, right to left, then the other hand, left to right, bobbing on the beat, looking a touch down; the raised hand flattens into a plump oval and the plush arm hugs the head's edge up to it from nose height, joining the body without a seam; now and then he pushes right up to the screen while he looks; the face never changes.
// `/twen busy kongming`: Kongming, 孔明, in a blue-grey 綸巾 cap, drooping whiskers and a pointed goatee, paces in thought along an arc, close to the screen in the middle and further off at each end, turned the way he walks, fanning his feather fan all the while; at the right end he turns back and tips his chin up to the Big Dipper out in the open sky on the left, its lines tracing star to star, the last stroke struck out with a red cross, at the left end to a full moon out on the right wearing Twen's face, two long flat clouds drifting past it, the upper one leftwards, the lower one rightwards; now and then he turns to you, hides behind the fan and peeks out, leaning in towards you; the face never changes.
// `/twen idle lean-hd` is the same lean drawn with quadrant cells (2x2 pixels per cell): twice the columns, two colours per cell.
// Drawn with half-block cells (two square-ish pixels per cell), 3x3 supersampled inside the fur.

const FUR = 0xdcdde2, INK = 0x2f2f36, GOLD = 0xf2c14e, TEAL = 0x0abab5, DEF = 0x01000000
const CAP = 0x6f93a6, CAP_BAND = 0x46606f, CAP_RIB = 0x5c3b2a, PIPING = 0xc9d6de, GEM = 0xe6d9b0, FEATHER = 0xf4f1ea, FEATHER_ROOT = 0xa4a09a, FEATHER_TIP = 0x5d5a57, QUILL = 0x8e8e96, STICK = 0x2a2226, BRASS = 0xc9a24a, WOOD = 0x7a5436, SHINE = 0x5c5c66, MOONLIGHT = 0xf6e7b0, STARLIGHT = 0xf3ecd2, SKYLINE = 0x8795b8, CLOUD = 0x565d6e, CLOUD_LIT = 0xaab2c6, CROSS = 0xe5484d
const COLS = 64, ROWS = 16, TICK = 120, KEY = 'twen', SS = 3
const W = COLS, H = 2 * ROWS, NOSE_Y = 20 // the nose sits on this canvas row while idle, so the face grows around it

// The face in head units, measured off the photo: origin at the head's centre, y down, head radius 1.
// Everything hangs off the nose: the eyes sit just above it, the ω mouth peaks at its bottom edge, the freckles fill the mouth's bowls.
const HEAD = [0, 0, 1, 1.04]
const NOSE = [0, -0.44, 0.105, 0.085]
const BROWS = [[-0.19, -0.79], [0.19, -0.79]] // two dots, not joined
const EYES = [[-0.37, -0.51], [0.37, -0.51]] // smiling: the flat top of a ring
const EYE_R = 0.15, EYE_CUT = -0.08 // keep the ring only above cy + EYE_CUT
const EYE_SQ = 0.8, EYE_TILT = 0.2 // the arc is squashed a little flatter, and each eye tilts so its outer end droops, ハ style
const MOUTH = [[-0.165, -0.34], [0.165, -0.34]] // ω: the bottom halves of two rings, meeting under the nose
const MOUTH_R = 0.166, MOUTH_CUT = 0
const FRECKLES = [[-0.15, -0.31], [-0.2, -0.25], [0.15, -0.31], [0.2, -0.25]] // two per bowl; the photo's third is too faint to survive a pixel
const STROKE = 0.065
const LINE = 0.03 // the thinner outline round a hand and its arm
const HAND = { down: [0.63, 0.93], up: [-0.83, 1.06], brow: [-1.0, 1.07], r: 0.24 } // [angle, radius] round the head centre, mirrored for the other hand: down hides inside the body, up rests on top of the head, brow shades the eye just clear of the brow dot
const ARM = [0.7, 0.9] // where each arm leaves the body, mirrored; a guitar hand's outline opens towards it so it reads as attached
const FIND_ARM = { from: -0.45, w: 0.26, taper: 0.1, root: 0.3, seam: 0.12, line: 1.5 } // the finding arm leaves the body at nose height (`from`, the angle round the head centre) and lies along the head's edge, half over it, round to the hand: `w` thick at the shoulder, `taper` thinner by the hand, so it looks stretched; its outer edge is outlined `line` pixels thick, its inner edge a pixel, but not within `seam` radians of the shoulder, and over `root` radians below the shoulder the fur just swells out of the body, so it joins with no line
// Explorer-shaped electric guitar in head units, in its own frame: `along` runs from the neck joint up the neck, `across` is sideways (positive on the treble side).
// dir points the neck up-right; body is the outline as [along, across] corners; neck, head and pickup are [from, to, half-width] along the neck; hands sit at fret (on the neck) and strum (over the strings).
// Only the top of the body clears the bottom of the screen; the rest stays out of frame.
const GUITAR = { at: [0.3, 0.2], dir: -0.64, body: [[0, -0.14], [-0.44, -0.33], [-0.53, -0.2], [-1.1, -0.53], [-0.77, 0.31], [0.2, 0.4], [0.04, 0.13]], neck: [0, 1.2, 0.06], head: [1.2, 1.45, 0.1], pickup: [-0.32, -0.22, 0.16], fret: 0.95, strum: [-0.25, -0.1] }
// Kongming's kit in head units, face frame, everything lit from the upper left and in front.
// The cap is a small drum sitting on the crown, `w` wide at its foot and at `top`; its foot sits well clear of the brow dots and curves `arc` lower at the sides as it goes round, just enough to land on the head's outline, so no corner hangs off the head.
// A dark `band` runs round the foot with light piping along its top and a cream plaque at the front, `plaque` radians wide; brown ribs stand at `ribs` radians round the drum, soft pleats between.
// It casts a soft contact shadow `shadow` deep on the fur under its foot and round its sides onto the crown, and its foot has a shadowed lip, so it sits on the head rather than on the screen. The canvas crops its top.
// A round cap turning with the head keeps its outline; only what is on it goes round. So it takes just `persp` of the head's perspective, keeping its band level, while the plaque and ribs turn with him;
// where the crown falls away beneath it on the far side, the drum carries on down to meet the head.
const HAT = { bottom: -0.97, arc: 0.05, top: -1.55, w: [0.47, 0.5], band: 0.12, piping: 0.025, plaque: 0.15, ribs: [0.45, 1.05], rib: 0.09, shadow: 0.07, persp: 0.35 }
// Whiskers: a curve through `whisker` from just past each mouth corner, out and then down, tapering to a point (mirrored).
// The goatee hangs from under the ω, `hw` wide at `top`, narrowing to a point at `tip` that curls `curl` to one side, with a sheen down its lit side.
const BEARD = { whisker: [[0.42, -0.36], [0.58, -0.3], [0.52, 0.06]], top: -0.1, tip: 0.36, hw: 0.085, curl: 0.05 }
// The feather fan, in his right hand, held low in front of him on the left of the screen, in untilted head units: the hand holds a dark wooden stick `stick` long pointing along `a`, bound in black with a brass `ring` at the top,
// then a long oval of feathers `L` by `W`: one every `ray` radians fanning out from the binding, grey at the root, white along the vane with soft grey chevron `bars` across it like the reference's, dark at the `tip` like a crane's, each tucked under the next, pointed at the rim, cupped so the sides fall into shade.
// Hidden behind, the hand moves to `cover`, the fan points straight up and grows `grow` times, enough to cover the face.
const FAN = { hand: [-0.55, 0.45], cover: [0, 0.35], a: -2.1, stick: 0.18, L: 0.42, W: 0.27, grow: 2.15, ray: 0.3, ring: 0.12, tip: 0.8, bars: 7 }
const PEEK = 0.37 // how far the head leans out from behind the fan, head units: one eye clears it

const tone = (c, k) => { const f = x => Math.min(255, Math.max(0, Math.round(x * k))); return (f(c >> 16) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255) }
const blend = (a, b, k) => [16, 8, 0].reduce((c, sh) => c | (Math.round(((a >> sh) & 255) + (((b >> sh) & 255) - ((a >> sh) & 255)) * k) << sh), 0)
const ellipse = (u, v, [cx, cy, rx, ry]) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1
const ring = (u, v, [cx, cy], r, w) => Math.abs(Math.hypot(u - cx, v - cy) - r) <= w / 2
const inside = (a, c, pts) => { // even-odd point-in-polygon
  let hit = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ai, ci] = pts[i], [aj, cj] = pts[j]
    if (ci > c !== cj > c && a < ai + ((aj - ai) * (c - ci)) / (cj - ci)) hit = !hit
  }
  return hit
}
// A round hand centred at (hu, hv) seen from (u, v): fur, outlined in ink except where it faces the arm at (au, av), so it reads as attached; 0 outside it.
// `flat` 0..1 squashes it into a plump horizontal oval (a hand held flat over the brow).
const ball = (u, v, hu, hv, [au, av], R, flat = 0) => {
  const rx = HAND.r * (1 + 0.3 * flat), ry = HAND.r * (1 - 0.4 * flat)
  const d = Math.hypot((u - hu) / rx, (v - hv) / ry)
  if (d > 1) return 0
  if (d <= 1 - Math.max(LINE, 1 / R) / ry) return FUR
  const tu = au - hu, tv = av - hv
  return ((u - hu) * tu + (v - hv) * tv) / (Math.hypot(u - hu, v - hv) * Math.hypot(tu, tv)) > 0.5 ? FUR : INK
}
// The plush arm lying along the head's edge on `side`, from the shoulder at nose height round to the hand at angle `a`: fur, outlined on both edges except at the shoulder, where it swells out of the body with no seam; 0 outside it.
const arm = (u, v, side, a, R) => {
  const th = Math.atan2(v, side * u)
  if (a >= FIND_ARM.from || th < a || th > FIND_ARM.from + FIND_ARM.root) return 0
  const rho = Math.hypot(u / HEAD[2], v / HEAD[3]), hw = (FIND_ARM.w - FIND_ARM.taper * Math.max(0, (FIND_ARM.from - th) / (FIND_ARM.from - a))) / 2
  if (th > FIND_ARM.from) return rho <= 1 + hw * (1 - ease((th - FIND_ARM.from) / FIND_ARM.root)) ? FUR : 0 // the shoulder
  if (rho < 1 - hw || rho > 1 + hw) return 0
  return rho > 1 + hw - Math.max(LINE, FIND_ARM.line / R) || (rho < 1 - hw + Math.max(LINE, 1 / R) && th < FIND_ARM.from - FIND_ARM.seam) ? INK : FUR
}
// Kongming's cap and beard at (u, v) on the head, `fv` in the face frame (slid up while he looks up); the cap is drawn at (cu, cv) in its own frame, its pattern turned `yaw` radians, and sits `drop` higher while it comes down onto the head. 0 elsewhere.
const kit = (u, v, fv, R, drop, cu, cv, yaw) => {
  const hv = cv + drop, hw = HAT.w[0] + ((HAT.w[1] - HAT.w[0]) * (HAT.bottom - hv)) / (HAT.bottom - HAT.top), n = cu / hw, onHead = ellipse(u, v, HEAD)
  if (hv >= HAT.top) {
    const an = Math.abs(n), foot = HAT.bottom + HAT.arc * Math.min(1, n * n)
    if (an <= 1 && (hv <= foot || (!onHead && v < 0 && hv < foot + 0.3))) {
      const th = Math.asin(n), ph = th - yaw, lit = 0.45 + 0.65 * Math.max(0, 0.87 * Math.cos(th) - 0.4 * n), up = foot - hv // Lambert on the drum, lit from a fixed side; `ph` is round the drum from its front; height above the foot
      if (up < 0) return tone(CAP_BAND, lit) // carried down to the head on the far side
      if (up < 0.022) return tone(CAP_BAND, 0.7 * lit) // the lip, turned under
      if (up < HAT.band) {
        if (Math.abs(ph) < HAT.plaque && up > 0.025 && up < HAT.band - 0.025) return tone(GEM, Math.abs(ph) > HAT.plaque - 0.05 || up < 0.05 ? 0.62 * lit : 1.15 * lit - 0.3 * (up - 0.05)) // bevelled: dark rim, lit face
        return up > HAT.band - HAT.piping ? tone(PIPING, lit) : tone(CAP_BAND, lit)
      }
      if (HAT.ribs.some(r => Math.abs(Math.abs(ph) - r) < HAT.rib)) return tone(CAP_RIB, lit)
      return tone(CAP, lit * (1 + 0.05 * Math.cos(12 * ph)))
    }
    const out = Math.max((hv - foot) / HAT.shadow, ((an - 1) * hw) / HAT.shadow) // 0 at the cap's edge, 1 where its shadow ends: below the foot, or beside the drum
    if (out < 1 && onHead) return tone(FUR, 0.72 + 0.28 * out)
  }
  const au = Math.abs(u), w = Math.max(0.05, 1.1 / R) / 2, [p0, p1, p2] = BEARD.whisker
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, a = (1 - t) ** 2, b = 2 * t * (1 - t), c = t * t
    if (Math.hypot(au - a * p0[0] - b * p1[0] - c * p2[0], fv - a * p0[1] - b * p1[1] - c * p2[1]) <= w * (1 - 0.6 * t)) return INK
  }
  if (fv >= BEARD.top && fv <= BEARD.tip) {
    const t = (fv - BEARD.top) / (BEARD.tip - BEARD.top), across = (u - BEARD.curl * t * t) / Math.max(BEARD.hw * (1 - t) ** 0.8, w * (1 - t))
    if (Math.abs(across) <= 1) return Math.abs(across + 0.35) < 0.25 && t < 0.8 ? SHINE : INK
  }
  return 0
}
// The feather fan at (u, v), untilted head units round the head centre: the plush hand, the stick, the binding and the feathers.
// `wave` swings it and turns its face side-on, so it narrows and one half catches the light; `hide` brings it up over the face; `fanX` slides it against the head so it stays put while he leans out from behind it. 0 elsewhere.
const fan = (u, v, R, wave, hide, fanX) => {
  const hu = FAN.hand[0] + (FAN.cover[0] - FAN.hand[0]) * hide - fanX, hv = FAN.hand[1] + (FAN.cover[1] - FAN.hand[1]) * hide
  const hand = ball(u, v, hu, hv, [hu / 2, hv + 0.8], R) // outline open towards the body
  if (hand) return hand
  const a = FAN.a + (-Math.PI / 2 - FAN.a) * hide + wave, g = 1 + (FAN.grow - 1) * hide, ca = Math.cos(a), sa = Math.sin(a)
  const along = (u - hu) * ca + (v - hv) * sa, across = (v - hv) * ca - (u - hu) * sa
  if (along >= 0 && along <= FAN.stick) return Math.abs(across) <= Math.max(0.03, 0.7 / R) ? tone(WOOD, across < 0 ? 1.2 : 0.85) : 0
  const L = FAN.L * g, Wf = FAN.W * g, fa = along - FAN.stick, turned = Math.abs(wave) / 0.3, ac = across / (1 - 0.36 * turned)
  const k = Math.atan2(ac, fa) / FAN.ray, s = k - Math.round(k) // which feather, and where across it (-0.5..0.5)
  const d = Math.hypot((fa - L) / L, ac / Wf), rim = 1 - 0.45 * s * s // notched between feathers, so each tip comes to a point
  if (d > rim || fa < 0) return 0
  if (fa < FAN.ring * L) return fa > 0.7 * FAN.ring * L ? BRASS : STICK
  const light = (0.8 + 0.22 * Math.sqrt(Math.max(0, 1 - (ac / Wf) ** 2))) * (1 - 0.2 * turned + 0.15 * Math.sign(wave) * (ac / Wf)) * (1.02 - 0.06 * (s + 0.5)) // cupped, turned, tucked
  const f = fa / (2 * L), bar = (((f * FAN.bars + Math.abs(s) * 1.2) % 1) + 1) % 1 // chevrons, pointing up each feather
  let c = f > FAN.tip ? blend(FEATHER, FEATHER_TIP, Math.min(1, (f - FAN.tip) / 0.08)) : blend(FEATHER_ROOT, FEATHER, Math.min(1, Math.max(0, (f - 0.12) / 0.4)))
  if (f > 0.25 && f < FAN.tip && bar < 0.22) c = blend(c, FEATHER_TIP, 0.35)
  if (d > rim - 1.1 / (R * Wf)) return tone(c, 0.72 * light) // the feather tips' edge
  return tone(Math.abs(s) * Math.hypot(fa, ac) * FAN.ray < 0.45 / R && f > 0.2 && f < FAN.tip ? blend(c, QUILL, 0.4) : c, light)
}
// Colour at canvas point (x, y) under a pose, or 0 where nothing is drawn.
export function pixel(x, y, { R, cx, cy, tilt, sx, sy, shear, persp, nod, brow, hands, find, guitar, strum, rock, kong, up, wave, hide, fanX, fanZ, fanP, fanN }) {
  const dx = x - cx, dy = y - cy
  if (kong > 0.5) { // Kongming's fan is held in front of him, so it comes first and stays upright; it turns (`fanP`) and tips (`fanN`) in depth like the head, keeps its size while his head comes `fanZ` closer, and rises from below as `kong` eases in
    const z = (1 + fanZ) / R, fu = dx * z, fv = dy * z, kf = 1 + fanP * fu - fanN * fv
    const c = kf > 0.3 && fan(fu / kf, fv / kf - 2 * (1 - kong), R / (1 + fanZ), wave, hide, fanX)
    if (c) return c
  }
  const c = Math.cos(tilt), s = Math.sin(tilt)
  let u = (dx * c + dy * s) / (R * sx), v = (dy * c - dx * s) / (R * sy)
  const u0 = u, v0 = v, k = 1 + persp * u - nod * v // one side of the face closer to the screen; nod brings the top of the head closer, as if leaning forward
  if (k < 0.3) return 0
  u /= k; v /= k
  u -= shear * (v + 0.45) // the body swings under the face
  if (guitar > 0.5) { // shredding: one hand on the neck, the other strumming, both over a Tiffany-green guitar that rocks with him; it rises from below as `guitar` eases in
    const a = GUITAR.dir + rock, ca = Math.cos(a), sa = Math.sin(a), gu = u - GUITAR.at[0], gv = v - GUITAR.at[1] - 2 * (1 - guitar)
    const along = gu * ca + gv * sa, across = gv * ca - gu * sa
    for (const [ha, hc, side] of [[GUITAR.fret, 0, 1], [GUITAR.strum[0], GUITAR.strum[1] + strum, -1]]) { // fret hand is his left arm, strum hand his right; outlined, or they vanish into the fur
      const c = ball(u, v, GUITAR.at[0] + ha * ca - hc * sa, GUITAR.at[1] + 2 * (1 - guitar) + ha * sa + hc * ca, [side * ARM[0], ARM[1]], R)
      if (c) return c
    }
    const bar = ([from, to, hw]) => along >= from && along <= to && Math.abs(across) <= hw
    if (bar(GUITAR.pickup)) return INK
    if (inside(along, across, GUITAR.body)) return TEAL
    if (bar(GUITAR.neck)) return INK
    if (bar(GUITAR.head)) return TEAL
  }
  if (find) { // one hand (sign picks the side) swings up round the head to shade the brow, flattening as it gets there, outlined so it shows against the fur; the arm reaches it along the head's edge from the shoulder
    const h = Math.abs(find), side = Math.sign(find), a = HAND.down[0] + (HAND.brow[0] - HAND.down[0]) * h, r = HAND.down[1] + (HAND.brow[1] - HAND.down[1]) * h
    const hu = side * r * Math.cos(a), hv = r * Math.sin(a)
    const c = ball(u, v, hu, hv, [side * r * Math.cos(a + 0.3), r * Math.sin(a + 0.3)], R, h)
    if (c) return c
    const a2 = arm(u, v, side, a, R)
    if (a2) return a2
  }
  if (hands > 0) { // both hands swing up round the head and sit on it like bear ears
    const a = HAND.down[0] + (HAND.up[0] - HAND.down[0]) * hands, r = HAND.down[1] + (HAND.up[1] - HAND.down[1]) * hands
    if (Math.hypot(Math.abs(u) - r * Math.cos(a), v - r * Math.sin(a)) <= HAND.r) return FUR
  }
  const look = 0.1 * up // looking up at the sky: the face, and all he wears on it, slides up the head
  if (kong > 0.5) { const kc = 1 + HAT.persp * persp * u0 - nod * v0, c = kit(u, v, v + look, R, 2 * (1 - kong), u0 / kc, v0 / kc + look, -0.5 * persp); if (c) return c }
  if (!ellipse(u, v, HEAD)) return 0
  v += look
  if (v > -0.08 || v < -0.95 || Math.abs(u) > 0.6) return FUR // plain fur outside the face
  return face(u, v, R, brow) || FUR
}
// Twen's face at (u, v) in head units, R pixels to a unit: ink on its lines and dots, 0 elsewhere. `brow` lifts the near brow, Rock style.
const face = (u, v, R, brow) => {
  const w = Math.max(STROKE, 1 / R), dot = Math.max(0.03, 0.71 / R), fleck = Math.max(0.022, 0.55 / R) // strokes and dots stay about a pixel
  if (ellipse(u, v, NOSE)) return INK
  for (const [ex, ey] of EYES) { // rotate the sample into the eye's tilted frame, then flatten it
    const a = Math.sign(ex) * EYE_TILT, ca = Math.cos(a), sa = Math.sin(a), du = u - ex, dv = v - ey
    const eu = du * ca + dv * sa, ev = (dv * ca - du * sa) / EYE_SQ
    if (ev < EYE_CUT && ring(eu, ev, [0, 0], EYE_R, w)) return INK
  }
  for (const m of MOUTH) if (v > m[1] + MOUTH_CUT && ring(u, v, m, MOUTH_R, w)) return INK
  for (const [bx, by] of BROWS) { // the brow on the near side lifts, Rock style
    const lift = bx * brow > 0 ? 0.05 * Math.abs(brow) : 0
    if (Math.hypot(u - bx, v - by + lift) <= dot) return INK
  }
  for (const [fx, fy] of FRECKLES) if (Math.hypot(u - fx, v - fy) <= fleck) return INK
  return 0
}

const ease = x => x * x * (3 - 2 * x)

// Where Twen is on the 64x32 canvas. Idle: lean 0..1 into the screen, turn -1..1 says which eye is closer.
// Busy: sits straight with both hands up on his head, under stars.
export function pose(busy, t, lean = 0, turn = 0) {
  if (busy) return { ...pose(false, t), hands: 1, stars: 1 }
  const l = ease(lean), R = 28 + 12 * l
  return { R, cx: W / 2 - 3 * l * turn, cy: NOSE_Y - NOSE[1] * R, tilt: 0.18 * l * turn, sx: 1, sy: 1, shear: 0, persp: 0.45 * l * turn, nod: 0, brow: l * turn, hands: 0, find: 0, guitar: 0, strum: 0, rock: 0, kong: 0, up: 0, trace: 0, wave: 0, hide: 0, fanX: 0, fanZ: 0, fanP: 0, fanN: 0, sky: 0, stars: 0, fire: 0, hd: 0 }
}

export const mix = (a, b, k) => Object.fromEntries(Object.keys(a).map(key => [key, a[key] + (b[key] - a[key]) * k]))

// Kongming's routine as [ticks, where he gets to]: each step eases from where the last one left him. Unset fields are 0.
// x: along his walk, -1..1; face: which way he looks, -1..1; up: gazing at the sky; trace: how far the sky has played out (the Dipper's lines, the clouds' drift); hide: the fan over his face; peek: leaning out from behind it, -1..1.
// A lap: in the middle, turned right, he ponders, walks right, turns back and looks up at the Big Dipper over on the left, lowers his chin, walks all the way left, turns back and looks up at the moon over on the right, walks back to the middle; or he turns to you, hides behind the fan and peeks out right, then left.
// Nowhere does he stand square to the screen: he is always turned one way or the other, and a slow sway (see kongming) keeps him moving in depth.
const LAP = [[4, { face: 1 }], [14, { x: 1, face: 1 }], [3, { x: 1, face: -0.5 }], [3, { x: 1, face: -0.5, up: 1 }], [14, { x: 1, face: -0.5, up: 1, trace: 1 }], [4, { x: 1, face: -0.5, up: 1, trace: 1 }], [2, { x: 1, face: -0.5, trace: 1 }], [3, { x: 1, face: -1 }],
  [28, { x: -1, face: -1 }], [3, { x: -1, face: 0.5 }], [3, { x: -1, face: 0.5, up: 1 }], [18, { x: -1, face: 0.5, up: 1, trace: 1 }], [2, { x: -1, face: 0.5, trace: 1 }], [3, { x: -1, face: 1 }], [14, { face: 1 }]]
const HIDE = [[4, { hide: 1 }], [6, { hide: 1 }], [3, { hide: 1, peek: 1 }], [4, { hide: 1, peek: 1 }], [3, { hide: 1 }], [6, { hide: 1 }], [3, { hide: 1, peek: -1 }], [2, { hide: 1, peek: -1 }], [3, { hide: 1 }], [4, { hide: 1 }], [4, { face: 1 }]]
export const KONG = [...LAP, ...HIDE, ...LAP, ...LAP].map(([n, to]) => [n, { x: 0, face: 0, up: 0, trace: 0, hide: 0, peek: 0, ...to }])
const KONG_T = KONG.reduce((sum, [n]) => sum + n, 0)
const routine = t => { // where Kongming is at tick t, and whether he is walking
  let from = KONG[KONG.length - 1][1]
  t %= KONG_T
  for (const [n, to] of KONG) {
    if (t < n) return { ...mix(from, to, ease(t / n)), walking: from.x !== to.x }
    t -= n; from = to
  }
}

// Average the drawn samples of one canvas pixel (w wide) of colour function f; transparent unless at least half are drawn.
const sample = (x, y, f, w = 1) => {
  let n = 0, r = 0, g = 0, b = 0
  for (let i = 0; i < SS; i++) for (let j = 0; j < SS; j++) {
    const c = f(x + ((i + 0.5) * w) / SS, y + (j + 0.5) / SS)
    if (c) { n++; r += c >> 16; g += (c >> 8) & 255; b += c & 255 }
  }
  return 2 * n < SS * SS ? 0 : (Math.round(r / n) << 16) | (Math.round(g / n) << 8) | Math.round(b / n)
}

const SPARKS = [[-30, 0], [-26, 5], [-22, 10], [-29, 14], [-24, 17], [-19, 2], [-13, 1], [-8, 3], [-31, 8], [-16, 12], [9, 0], [14, 4], [24, 2], [28, 7], [22, 12], [30, 15], [26, 17], [18, 1], [31, 10], [12, 9]]
const BURSTS = [[-24, 3], [22, 2], [-18, 9], [26, 9], [-28, 12], [16, 5]] // firework centres as [dc, dr] off the canvas middle, lit two at a time in turn
const BURST_T = 8 // ticks per burst: eight rays grow out of the centre, then the next one lights
// Kongming's sky, on the 64x32 canvas behind him, one sight at a time, each set out in the open sky he leaves behind him at the end of his walk.
// From the right end, the Big Dipper, 北斗七星, over on the left, as [col, row] from its stars' real places (north up): Dubhe and Merak, the pointers, at the right of the bowl, Megrez and Phecda at its left,
// then the handle, Alioth, Mizar with faint Alcor above it, Alkaid at its end, curving down to the left.
// From the left end, a full moon, 滿月, over on the right: a disc `r` round `at`, shaded as a ball lit from the upper left and in front, wearing Twen's face, `face` head units across its radius.
const DIPPER = [[24, 1], [25, 4], [17, 5], [14, 3], [9, 4], [4, 4], [1, 7]], ALCOR = [4, 3] // a degree of sky to a column, true to shape
// While he looks, its lines are traced in the old order, 天樞 天璇 天璣 天權 玉衡 開陽 搖光, then 天權 back to 天樞 to close the bowl; the pen's tip glows.
// That last stroke is wrong, so once it is drawn a red cross, `CROSS_R` px each way, is struck through its middle.
const DIPPER_LINES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 0]], CROSS_R = 1
const MOON = { at: [52, 10], r: 8.5, face: 0.75 }
// Two long flat night clouds drift past while he looks, `drift` pixels (leftwards when negative): the upper one comes in from the right and ends grazing the top of the moon,
// the lower one starts grazing its bottom and drifts off to the right. Each is a row of flattened puffs [dx, dy, rx, ry] off `at`, cut flat `base` below it, silvered on top and where the moon is near.
const CLOUDS = [{ at: [60, 1.5], drift: -9, base: 0.9, puffs: [[-4.5, 0.3, 2.6, 1.1], [-1.2, -0.3, 3.2, 1.5], [2.4, 0.1, 2.8, 1.2], [5.2, 0.4, 2, 0.9]] },
  { at: [55, 19.5], drift: 9, base: 0.9, puffs: [[-5, 0.3, 2.4, 1], [-1.8, -0.4, 3, 1.4], [1.6, 0, 3.2, 1.3], [4.8, 0.3, 2.2, 0.9]] }]
const moon = (x, y) => {
  const { at: [mx, my], r } = MOON, nx = (x - mx) / r, ny = (y - my) / r, d2 = nx * nx + ny * ny, R = r / MOON.face
  if (d2 > 1) return 0
  if (face((x - mx) / R, (y - my) / R - 0.5, R, 0)) return INK // the face's middle, half a head unit above the nose's level, on the moon's middle
  return tone(MOONLIGHT, 0.72 + 0.3 * Math.max(0, -0.45 * nx - 0.45 * ny + 0.77 * Math.sqrt(1 - d2)))
}
const cloud = (x, y, trace) => {
  for (const { at: [ax, ay], drift, base, puffs } of CLOUDS) {
    const cx = ax + drift * trace
    if (y < ay + base && puffs.some(([dx, dy, rx, ry]) => Math.hypot((x - cx - dx) / rx, (y - ay - dy) / ry) < 1)) {
      const glow = Math.max(0, 1 - Math.hypot(x - MOON.at[0], y - MOON.at[1]) / 12)
      return blend(CLOUD, CLOUD_LIT, Math.min(1, 0.2 + (0.35 * (ay - y)) / 1.5 + 0.7 * glow))
    }
  }
  return 0
}
// The Big Dipper's lines at (x, y), `trace` of the way through tracing them; the pen's tip glows. 0 elsewhere.
const skyline = (x, y, trace) => {
  const n = DIPPER_LINES.length, [[ac, ar], [bc, br]] = DIPPER_LINES[n - 1].map(j => DIPPER[j]), dx = Math.abs(Math.floor(x) - (ac + bc) / 2), dy = Math.abs(Math.floor(y) - ar - br) // whole pixels round the stroke's middle one, so the line under it can't tint it; an even-sized cross would blot into a square there
  if (trace >= 1 && dx === dy && dx <= CROSS_R) return CROSS
  for (let i = 0; i < n; i++) {
    const f = Math.min(1, Math.max(0, trace * n - i))
    if (!f) break
    const [[ac, ar], [bc, br]] = DIPPER_LINES[i].map(j => DIPPER[j]), ax = ac + 0.5, ay = 2 * ar + 0.5, bx = bc + 0.5, by = 2 * br + 0.5 // on a pixel's middle, not between two, so a level line stays one pixel thin
    const len2 = (bx - ax) ** 2 + (by - ay) ** 2, s = Math.min(f, Math.max(0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / len2))
    if (Math.hypot(x - ax - s * (bx - ax), y - ay - s * (by - ay)) <= 0.55) return f < 1 && f - s < 1.5 / Math.sqrt(len2) ? STARLIGHT : SKYLINE
  }
  return 0
}

const half = (top, bot) => (top && bot ? [0x2580, top, bot] : top ? [0x2580, top, DEF] : bot ? [0x2584, bot, DEF] : [0x20, DEF, DEF])
export const QUAD = [0x20, 0x2598, 0x259d, 0x2580, 0x2596, 0x258c, 0x259e, 0x259b, 0x2597, 0x259a, 0x2590, 0x259c, 0x2584, 0x2599, 0x259f, 0x2588] // quadrant glyph by mask: TL=1 TR=2 BL=4 BR=8
const lum = c => 3 * (c >> 16) + 6 * ((c >> 8) & 255) + (c & 255)
const mean = cs => { let r = 0, g = 0, b = 0; for (const c of cs) { r += c >> 16; g += (c >> 8) & 255; b += c & 255 } const n = cs.length; return (Math.round(r / n) << 16) | (Math.round(g / n) << 8) | Math.round(b / n) }
// Four sub-pixels [TL, TR, BL, BR] as one quadrant cell. A cell holds two colours, so a full one is split where the brightness gap is widest; one with a hole shows the terminal through it.
const quad = q => {
  let lit = [0, 1, 2, 3].filter(i => q[i]), bg = DEF
  if (lit.length === 4) {
    lit.sort((a, b) => lum(q[a]) - lum(q[b]))
    let cut = 0, gap = 0
    for (let i = 1; i < 4; i++) { const g = lum(q[lit[i]]) - lum(q[lit[i - 1]]); if (g > gap) { gap = g; cut = i } }
    if (cut) { bg = mean(lit.slice(0, cut).map(i => q[i])); lit = lit.slice(cut) }
  }
  return lit.length ? [QUAD[lit.reduce((m, i) => m | (1 << i), 0)], mean(lit.map(i => q[i])), bg] : [0x20, DEF, DEF]
}

// One frame as cols x rows cells of [codepoint, fg, bg]; a smaller box just shows Twen smaller. p.stars, p.fire and p.sky (Big Dipper above 0.5, moon below -0.5) light the background; p.hd draws quadrant cells, two pixels per column.
export function paint(p, t, cols = COLS, rows = ROWS) {
  const k = Math.min((2 * rows) / H, cols / W)
  p = { ...p, R: p.R * k, cy: p.cy * k, cx: cols / 2 + (p.cx - W / 2) * k }
  const cell = (c, r, f) => (p.hd ? quad([sample(c, 2 * r, f, 0.5), sample(c + 0.5, 2 * r, f, 0.5), sample(c, 2 * r + 1, f, 0.5), sample(c + 0.5, 2 * r + 1, f, 0.5)]) : half(sample(c, 2 * r, f), sample(c, 2 * r + 1, f)))
  const twen = (x, y) => pixel(x, y, p), cells = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) row.push(cell(c, r, twen))
    cells.push(row)
  }
  const spark = (r, c, cp, fg = GOLD) => { if (r >= 0 && r < rows && c >= 0 && c < cols && cells[r][c][0] === 0x20) cells[r][c] = [cp, fg, DEF] }
  if (p.stars > 0.5) SPARKS.forEach(([dc, dr], i) => spark((Math.round(dr * k) + (t >> 1)) % rows, Math.round(cols / 2 + dc * k), [0x2a, 0x2b, 0x2e][(t + i) % 3])) // twinkling, drifting down behind him
  if (p.fire > 0.5) for (let b = 0; b < 2; b++) { // fireworks: rays fly out of a centre and fade to dots
    const [dc, dr] = BURSTS[(2 * Math.floor(t / BURST_T) + b) % BURSTS.length], ph = t % BURST_T
    for (let i = 0; i < 8; i++) spark(Math.round(dr * k + Math.sin((Math.PI / 4) * i) * ph * 0.5), Math.round(cols / 2 + dc * k + Math.cos((Math.PI / 4) * i) * ph), ph < BURST_T - 2 ? 0x2a : 0x2e)
  }
  if (Math.abs(p.sky) > 0.5) { // Kongming looking up, behind him: from the right end the Big Dipper, its lines under its stars; from the left end the moon, clouds over it
    const open = cells.map(row => row.map(([cp]) => cp === 0x20)), to = f => (x, y) => f(W / 2 + (x - cols / 2) / k, y / k)
    const back = p.sky > 0 ? to((x, y) => skyline(x, y, p.trace)) : to((x, y) => cloud(x, y, p.trace) || moon(x, y))
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (open[r][c]) cells[r][c] = cell(c, r, back)
    const star = ([dc, dr], cp, fg) => { const r = Math.round(dr * k), c = Math.round(cols / 2 + (dc - W / 2) * k); if (open[r]?.[c]) cells[r][c] = [cp, fg, DEF] }
    if (p.sky > 0) { DIPPER.forEach((at, i) => star(at, i === 6 && t & 4 ? 0x2b : 0x2a, STARLIGHT)); star(ALCOR, 0x2e, tone(STARLIGHT, 0.7)) } // Alkaid, at the end of the handle, twinkles
  }
  return cells
}

const encode = cells => {
  const buf = new DataView(new ArrayBuffer(cells.length * cells[0].length * 12))
  let o = 0
  for (const row of cells) for (const [cp, fg, bg] of row) {
    buf.setUint32(o, cp, true); buf.setUint32(o + 4, fg, true); buf.setUint32(o + 8, bg, true); o += 12
  }
  return btoa(String.fromCharCode(...new Uint8Array(buf.buffer)))
}

// The same cells as SVG, for surfaces with no Raster (desktop, editor, mobile): each cell is 2x4 units, its quadrants 1x2,
// one path per colour, horizontal runs merged; sparks stay glyphs. DEF draws nothing, so the theme shows through.
const hex = c => '#' + c.toString(16).padStart(6, '0')
export function svg(cells) {
  const rows = cells.length, cols = cells[0].length, paths = new Map(), glyphs = []
  for (let r = 0; r < rows; r++) for (let half = 0; half < 2; half++) {
    let run = null // [colour, from x]
    const flush = x => { if (run && run[0] !== DEF) paths.set(run[0], (paths.get(run[0]) ?? '') + `M${run[1]} ${4 * r + 2 * half}h${x - run[1]}v2h${run[1] - x}z`) }
    for (let x = 0; x <= 2 * cols; x++) {
      let colour = DEF
      if (x < 2 * cols) {
        const [cp, fg, bg] = cells[r][x >> 1], mask = QUAD.indexOf(cp)
        if (mask < 0) { if (!half && !(x & 1)) glyphs.push(`<text x="${x + 1}" y="${4 * r + 3.2}" fill="${hex(fg)}">${String.fromCharCode(cp)}</text>`) }
        else colour = mask & (1 << (2 * half + (x & 1))) ? fg : bg
      }
      if (!run || colour !== run[0]) { flush(x); run = [colour, x] }
    }
  }
  const body = [...paths].map(([c, d]) => `<path fill="${hex(c)}" d="${d}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${2 * cols} ${4 * rows}" shape-rendering="crispEdges">${body}<g font-family="monospace" font-size="4" text-anchor="middle">${glyphs.join('')}</g></svg>`
}

// What Twen does while idle and while a turn runs, picked separately: `/twen idle <name>`, `/twen busy <name>`.
// Each entry answers a pose; the frame eases from the idle one to the busy one as a turn starts.
// ponytail: a new move is one more entry here, nothing else changes.
export const IDLE = {
  lean: (t, lean, turn) => pose(false, t, lean, turn),
  'lean-hd': (t, lean, turn) => ({ ...pose(false, t, lean, turn), hd: 1 }), // the same lean at twice the columns
}
export const BUSY = {
  bear: t => pose(true, t),
  guitar: t => ({ ...pose(false, t), R: 20, cy: 20.8, guitar: 1, fire: 1, strum: t & 1 ? 0.1 : -0.1, rock: t & 1 ? 0.1 : -0.1 }), // steps back a little and shreds under fireworks
  finding: t => { // shades his brow with one hand and swings the head nearly all the way round, 14 ticks a side (2 hand up, 10 turning across, 2 down), then the other hand back the other way; looks a touch down the whole time, the face stays put, the whole of him bobs on the beat; every 84 ticks he pushes right up to the screen for a bar (6 in, 16 there, 6 back) and keeps scanning there
    const P = 14, k = t % P, side = t % (2 * P) < P ? 1 : -1, p = pose(false, t), c = t % 84
    const lift = ease(k < 2 ? k / 2 : k < P - 2 ? 1 : (P - k) / 2), turn = side * Math.cos((Math.PI * Math.min(Math.max(k - 2, 0), P - 4)) / (P - 4))
    const close = ease(c < 56 ? 0 : c < 62 ? (c - 56) / 6 : c < 78 ? 1 : (84 - c) / 6)
    return { ...p, R: p.R + 18 * close, cx: W / 2 + 6 * turn, cy: p.cy + 4 * close + (t & 2 ? 1.5 : 0), tilt: 0.15 * turn, persp: -0.5 * turn, nod: 0.08, find: side * lift }
  },
  'guitar-3d': t => { // shreds while swaying into the screen like the lean, a full sweep every 16 ticks, nodding forward each time he passes the middle so the head rolls; every 64 ticks he leans right up to the screen for a bar (8 in, 16 there, 8 back)
    const turn = Math.sin((Math.PI * t) / 8), nod = (1 + Math.cos((Math.PI * t) / 4)) / 2, k = t % 64
    const close = ease(k < 8 ? k / 8 : k < 24 ? 1 : k < 32 ? (32 - k) / 8 : 0)
    return { ...BUSY.guitar(t), R: 20 + 8 * close, cy: 20.8 + 2 * close, cx: W / 2 - 5 * turn, tilt: 0.18 * turn, persp: 0.35 * turn, nod: 0.2 * nod, brow: turn }
  },
  kongming: t => { // follows his routine in depth, in cap and beard: an arc, close in the middle and further off at each end; turned the way he walks, tilting against the turn like the lean, looking a touch down in thought, a little more as he turns about;
    // out at each end, far enough to leave open sky behind him (further right, where the Dipper is wide; less far left, so the fan in his left-hand side stays in frame), chin up to the Big Dipper (right end) or the moon (left end), which comes out while he looks; bowing behind the fan and leaning in towards you as he peeks, the fan keeping its place; all the while swaying slowly round and nodding, nine times a routine, so he is never flat to the screen; bobbing each step and fanning all the while except behind the fan, swinging it out and back, never across his face
    const { x, face, up, trace, hide, peek, walking } = routine(t), base = 21 + 4 * (1 - x * x), R = base + 4 * Math.abs(peek), a = (18 * Math.PI * t) / KONG_T
    const turn = -0.4 * face + 0.15 * (1 - 0.6 * Math.abs(face)) * Math.sin(a), persp = turn + 0.3 * peek
    return { ...pose(false, t), R, cx: W / 2 + (x > 0 ? 16 : 12) * x + 4 * face + PEEK * base * peek, cy: 19 - NOSE[1] * base + (walking && t & 2 ? 1 : 0), tilt: 0.4 * persp + 0.15 * peek, persp, nod: 0.12 - 0.02 * Math.abs(face) - 0.2 * up + 0.06 * Math.cos(a), kong: 1, up, trace, wave: 0.15 * (1 - hide) * (Math.sin((Math.PI * t) / 3) - 1), hide, fanX: PEEK * peek, fanZ: R / base - 1, fanP: turn, fanN: -0.1 * hide, sky: up * x }
  },
}
const SLOTS = { idle: IDLE, busy: BUSY }

/** @type {import('claude-code').Register} */
export const register = (on) => {
  let t = 0, since = 0, busy = false, d = 0, site = null, vector = false, cols = COLS, rows = ROWS, last = '' // busy moves count ticks from `since`, so each turn starts from the top; vector: a surface without Raster draws Twen as Svg, redrawn each tick
  const picked = { idle: 'lean', busy: 'bear' }
  let lean = 0, turn = 0, flip = 1, leanAt = 48 // idle: next tick a lean-in starts (8 in, 32 sweeping across, 8 back)
  const later = () => t + 50 + Math.floor(Math.random() * 100)
  const cellsOf = (c, r) => { const idle = IDLE[picked.idle](t, lean, turn); return paint({ ...mix(idle, BUSY[picked.busy](t - since), d), hd: idle.hd }, t, c, r) } // the idle move picks the resolution, busy or not
  const frame = () => encode(cellsOf(cols, rows))
  const status = () => `Twen: idle=${picked.idle} busy=${picked.busy}. Idle moves: ${Object.keys(IDLE).join(', ')}. Busy moves: ${Object.keys(BUSY).join(', ')}.`

  on('session.start', async ($, e, next) => {
    for (const slot in SLOTS) { const saved = await $.store.get(slot); if (saved in SLOTS[slot]) picked[slot] = saved }
    await $.command.register({ name: 'twen', description: "Show or switch Twen's idle and busy moves.", argumentHint: 'idle|busy <move>' })
    $.clock.every(TICK, () => {
      t++
      if (!d) since = t // fully idle: the next busy move starts here
      d += Math.max(-0.2, Math.min(0.2, (busy ? 1 : 0) - d)) // ease the hands up and down
      if (busy) { lean = 0; turn = 0; leanAt = later() }
      else if (t >= leanAt) {
        const k = t - leanAt
        lean = k < 8 ? k / 8 : k < 40 ? 1 : k < 48 ? (48 - k) / 8 : 0
        turn = -flip * Math.cos((Math.PI * Math.min(Math.max(k - 8, 0), 32)) / 32)
        if (k >= 48) { leanAt = later(); flip = -flip; turn = 0 }
      }
      if (vector) $.ui.invalidate('ui.render')
      if (!site) return
      const cells = frame()
      if (cells !== last) { last = cells; void $.ui.blit({ requestId: site, key: KEY, cells }) }
    })
    return next(e)
  })

  on('command.run', { command: 'twen' }, async ($, e) => {
    const [slot, move] = e.args.trim().split(/\s+/)
    if (!slot) return { text: status() }
    if (!(slot in SLOTS) || !(move in SLOTS[slot])) return { text: `Usage: /twen idle|busy <move>. ${status()}` }
    picked[slot] = move; await $.store.set(slot, move)
    return { text: status() }
  })

  on('prompt.submit', ($, e, next) => { busy = true; return next(e) })
  on('turn.complete', ($, e, next) => { busy = false; return next(e) })

  on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    if (e.surface !== 'terminal') { // ponytail: the whole band redraws each tick (~8/s); fewer ticks here if the desktop ever stutters
      vector = true; busy = e.props.isWorking
      const { Svg } = $.ui.resolve(e), source = svg(cellsOf(COLS, ROWS))
      return source.length > 131072 ? next(e) : Svg({ source, alt: 'Twen, a smiling seal plush', width: 6 * COLS, height: 12 * ROWS })
    }
    const fitRows = Math.min(ROWS, e.props.maxRows ?? ROWS), fitCols = Math.min(COLS, e.props.bodyColumns ?? COLS)
    if (fitCols < 40 || fitRows < 8) return next(e)
    site = e.requestId; rows = fitRows; cols = fitCols
    busy = e.props.isWorking
    const { Raster } = $.ui.resolve(e)
    last = frame()
    return Raster({ key: KEY, columns: cols, rows, cells: last })
  })
}
