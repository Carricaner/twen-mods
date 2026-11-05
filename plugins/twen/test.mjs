// Self-check: `node test.mjs` prints the frames and fails if the face is missing.
// `node test.mjs <busy 0|1> <t> [lean] [turn] [hd 0|1]` prints one frame.
import { paint, pose, mix, svg, IDLE, BUSY, KONG, QUAD, register } from './hooks/twen.js'
import assert from 'node:assert/strict'

const GOLD = 0xf2c14e, TEAL = 0x0abab5, DEF = 0x01000000
const px = c => {
  if (c === DEF) return '.'
  if (c === GOLD) return '*'
  const l = ((c >> 16) + ((c >> 8) & 255) + (c & 255)) / 3
  return l > 190 ? 'o' : l > 110 ? '+' : '#'
}
const MASK = Object.fromEntries(QUAD.map((cp, m) => [cp, m]))
const show = (label, cells, hd = false) => {
  console.log(`== ${label}`)
  for (const row of cells) {
    let top = '', bot = ''
    for (const [cp, fg, bg] of row) {
      if (hd) { const m = MASK[cp] ?? 0, q = b => px(b ? fg : bg); top += q(m & 1) + q(m & 2); bot += q(m & 4) + q(m & 8) }
      else if (cp === 0x2580) { top += px(fg); bot += px(bg) }
      else if (cp === 0x2584) { top += '.'; bot += px(fg) }
      else if (cp === 0x20) { top += '.'; bot += '.' }
      else { top += '*'; bot += '*' }
    }
    console.log(top + '\n' + bot)
  }
}
const pixels = cells => cells.flatMap(row => row.flatMap(([cp, fg, bg]) => (cp === 0x2580 ? [fg, bg] : cp === 0x2584 ? [DEF, fg] : [DEF, DEF])))
const dark = c => c !== DEF && c !== GOLD && ((c >> 16) + ((c >> 8) & 255) + (c & 255)) / 3 < 110
const count = (cells, f) => pixels(cells).filter(f).length

if (process.argv[2] !== undefined) {
  const [busy, t, lean = 0, turn = 0, hd = 0] = process.argv.slice(2).map(Number)
  show(`busy=${busy} t=${t} lean=${lean} turn=${turn} hd=${hd}`, paint({ ...pose(!!busy, t, lean, turn), hd }, t), !!hd)
  process.exit(0)
}

const hi = paint(pose(false, 0), 0), idle = paint(pose(false, 40), 40)
const left = paint(pose(false, 40, 1, -1), 40), right = paint(pose(false, 40, 1, 1), 40)
const up = paint(pose(true, 4), 4), half = paint(mix(pose(false, 40), pose(true, 4), 0.5), 4)
show('hi', hi); show('idle', idle); show('leaning in, left eye close', left); show('leaning in, right eye close', right); show('hands up (bear)', up); show('hands halfway', half)

for (const cells of [hi, idle, left, right, up, half]) {
  assert.equal(cells.length, 16); assert.ok(cells.every(r => r.length === 64))
  for (const [cp] of cells.flat()) assert.ok([0x20, 0x2a, 0x2b, 0x2e, 0x2580, 0x2584].includes(cp), `bad char ${cp}`)
}
assert.ok(count(idle, dark) > 60, 'idle face has features')
assert.ok(count(idle, c => c !== DEF) > 900, 'idle body is filled')
assert.ok(count(idle, c => c === DEF) > 300, 'idle leaves room around Twen')
assert.deepEqual(pixels(hi), pixels(idle), 'no hand: session start looks like idle')
assert.ok(count(left, c => c !== DEF) > count(idle, c => c !== DEF) * 1.15, 'leaning in fills the box')
assert.notDeepEqual(pixels(left), pixels(right), 'each eye takes a turn up close')
assert.ok(count(up, c => c !== DEF) > count(idle, c => c !== DEF) + 40, 'hands up: ears poke out beyond the head')
assert.ok(count(half, c => c !== DEF) > count(idle, c => c !== DEF) + 40, 'hands halfway: arms show beside the head')
assert.notDeepEqual(pixels(up), pixels(half), 'hands travel')
assert.ok(up.flat().filter(([cp]) => cp === 0x2a || cp === 0x2b || cp === 0x2e).length >= 8, 'stars while busy')

// guitar: Twen steps back a little, the guitar is Tiffany green and rises from below, the strumming hand moves, fireworks instead of stars, and the face is untouched.
const shred = paint(BUSY.guitar(3), 3), plain = pixels(paint({ ...BUSY.guitar(3), guitar: 0, fire: 0 }, 3))
const rising = paint(mix(pose(false, 40), BUSY.guitar(3), 0.6), 3)
show('guitar', shred); show('guitar rising', rising)
assert.ok(count(shred, c => c === TEAL) > 30, 'guitar shows in Tiffany green')
assert.ok(count(rising, c => c === TEAL) < count(shred, c => c === TEAL) * 0.7, 'the guitar is still coming up from below')
assert.notDeepEqual(pixels(shred), pixels(paint(BUSY.guitar(4), 4)), 'strumming moves')
assert.ok(shred.flat().filter(([cp]) => cp === 0x2a || cp === 0x2e).length >= 8, 'fireworks while shredding')
assert.ok(plain.every((c, i) => !dark(c) || dark(pixels(shred)[i])), 'the guitar and hands never cover the face')

// guitar-3d: the same shredding, swaying into the screen and nodding forward; every 64 ticks he leans up close for a bar (ticks 8..24).
// Every pose keeps the face clean; while he is back (from tick 32) the guitar stays in view.
for (const t of [12, 16, 20, 36, 40, 44]) {
  const sway = paint(BUSY['guitar-3d'](t), t), flat = pixels(paint({ ...BUSY['guitar-3d'](t), guitar: 0, fire: 0 }, t))
  show(`guitar-3d t=${t}`, sway)
  if (t >= 32) assert.ok(count(sway, c => c === TEAL) > 30, `guitar-3d t=${t}: guitar in view`)
  assert.ok(flat.every((c, i) => !dark(c) || dark(pixels(sway)[i])), `guitar-3d t=${t}: face untouched`)
}
assert.notDeepEqual(pixels(paint(BUSY['guitar-3d'](36), 36)), pixels(paint(BUSY['guitar-3d'](44), 44)), 'guitar-3d sways both ways')
assert.notDeepEqual(pixels(paint(BUSY['guitar-3d'](40), 40)), pixels(paint({ ...BUSY['guitar-3d'](40), nod: 0 }, 40)), 'guitar-3d nods forward')
assert.ok(count(paint(BUSY['guitar-3d'](16), 16), c => c !== DEF) > count(paint(BUSY['guitar-3d'](48), 48), c => c !== DEF) * 1.3, 'guitar-3d leans up close for a bar')

// finding: one outlined hand shades the brow while the head swings right to left (ticks 2..12), then the other hand swings back (16..26); the face is never covered, and he bobs on the beat.
// The raised hand is a plump horizontal oval, the plush arm hugs the head's edge up to it with no seam at the shoulder, he looks a touch down, he never sinks, and every 84 ticks he pushes up close for a bar (62..78).
for (const t of [5, 7, 9, 19, 21, 23]) {
  const look = paint(BUSY.finding(t), t), bare = pixels(paint({ ...BUSY.finding(t), find: 0 }, t))
  show(`finding t=${t}`, look)
  assert.ok(bare.every((c, i) => !dark(c) || dark(pixels(look)[i])), `finding t=${t}: face untouched`)
  assert.ok(count(look, dark) > count(paint({ ...BUSY.finding(t), find: 0 }, t), dark) + 15, `finding t=${t}: the hand and the arm's outer edge are outlined`)
}
const at = (t, f) => { const cells = paint(BUSY.finding(t), t); let sum = 0, n = 0; cells.forEach((row, r) => row.forEach(([cp, fg], c) => { if (cp !== 0x20 && f(fg)) { sum += c; n++ } })); return sum / n }
assert.ok(at(7, dark) > at(7, c => c !== DEF) + 4, 'finding: first the right hand, on the right')
assert.ok(at(21, dark) < at(21, c => c !== DEF) - 4, 'finding: then the left hand, on the left')
assert.ok(BUSY.finding(3).cx > BUSY.finding(7).cx && BUSY.finding(7).cx > BUSY.finding(12).cx, 'finding: the head swings right to left')
assert.ok(BUSY.finding(17).cx < BUSY.finding(21).cx && BUSY.finding(21).cx < BUSY.finding(26).cx, 'finding: then back left to right')
assert.equal(BUSY.finding(13).cx, BUSY.finding(14).cx, 'finding: the head does not jump when the hands swap')
assert.ok(Math.abs(BUSY.finding(12).persp) > 0.4, 'finding: swings nearly all the way round')
assert.ok(BUSY.finding(7).nod > 0, 'finding: looks a touch down')
assert.ok(Math.abs(BUSY.finding(0).cy - BUSY.finding(7).cy) < 2 && Math.abs(BUSY.finding(14).cy - BUSY.finding(21).cy) < 2, 'finding: no sinking, only the bob')
// the arm hugs the head: on every pixel row of t=7 below the hand that ends in the arm's outline (right of the head), nothing transparent sits between the head and that outline
const rows = cells => cells.flatMap(row => [row.map(([cp, fg]) => (cp === 0x2580 ? fg : DEF)), row.map(([cp, fg, bg]) => (cp === 0x2580 ? bg : cp === 0x2584 ? fg : DEF))])
rows(paint(BUSY.finding(7), 7)).slice(10, 18).forEach((row, i) => {
  const last = 63 - [...row].reverse().findIndex(dark)
  if (last > 40) assert.ok(row.slice(row.findIndex(c => c !== DEF), last).every(c => c !== DEF), `finding: no gap between arm and head on row ${i + 10}`)
})
const only = t => pixels(paint({ ...pose(false, t), R: BUSY.finding(t).R, cx: BUSY.finding(t).cx, cy: BUSY.finding(t).cy, tilt: BUSY.finding(t).tilt, persp: BUSY.finding(t).persp, nod: BUSY.finding(t).nod }, t))
assert.deepEqual(pixels(paint({ ...BUSY.finding(0), find: 0 }, 0)), only(0), 'finding: the face is the idle face, only turned')
assert.notDeepEqual(pixels(paint(BUSY.finding(7), 7)), pixels(paint(BUSY.finding(9), 9)), 'finding: bobs on the beat')
assert.deepEqual(pixels(paint(BUSY.finding(0), 0)), only(0), 'finding: starts with no hand yet')
// the hand at the brow is wider than it is tall: measure the outlined blob above the head's top on the right at t=7
const brow = paint(BUSY.finding(7), 7), px7 = pixels(brow)
const blob = px7.map((c, i) => dark(c) && i % 64 > 44 && Math.floor(i / 64) < 10 ? i : -1).filter(i => i >= 0)
const wide = Math.max(...blob.map(i => i % 64)) - Math.min(...blob.map(i => i % 64)), tall = Math.max(...blob.map(i => Math.floor(i / 64))) - Math.min(...blob.map(i => Math.floor(i / 64)))
assert.ok(wide > tall * 1.3, `finding: the raised hand is a flat oval (${wide} wide, ${tall} tall)`)
show('finding up close t=63', paint(BUSY.finding(63), 63))
assert.ok(count(paint(BUSY.finding(63), 63), c => c !== DEF) > count(paint(BUSY.finding(35), 35), c => c !== DEF) * 1.2, 'finding: pushes up close for a bar')
assert.ok(BUSY.finding(56).R === BUSY.finding(28).R && BUSY.finding(84).R === BUSY.finding(28).R, 'finding: and comes back')

// kongming: in cap and beard, turned right in the middle, he ponders (ticks 0..4), walks right (4..18), turns back and looks up at the Big Dipper out on the left while its lines are traced (18..44), turns (44..47),
// walks all the way left (47..75), turns back and looks up at the moon out on the right while two clouds drift over it (75..101), turns (101..104), walks back (104..118), along an arc: close in the middle, further off at each end;
// then he hides behind the fan (118..160), peeking out right (128..138) and left (144..152). Off the fan, the face is exactly the plain face in the same pose.
// The cap, fan, beard and moon are shaded, so their colours vary: the cap is told by its blue, the feathers by their warm white, the moon and the cap's plaque by their cream.
const blue = c => c !== DEF && (c & 255) > 1.25 * (c >> 16) && (c & 255) - (c >> 16) > 12
const feather = c => c !== DEF && (c >> 16) - (c & 255) >= 3 && (c >> 16) - (c & 255) <= 20 && ((c >> 16) + ((c >> 8) & 255) + (c & 255)) / 3 > 120
const cream = c => c !== DEF && c !== GOLD && (c >> 16) - (c & 255) > 40 && ((c >> 16) + ((c >> 8) & 255) + (c & 255)) / 3 > 150
const kong = t => paint(BUSY.kongming(t), t), plainK = t => pixels(paint({ ...BUSY.kongming(t), kong: 0 }, t))
const starry = (cp, fg) => (cp === 0x2a || cp === 0x2b) && fg !== GOLD // a Dipper star; Alkaid twinkles between * and +
const dipper = cells => cells.flat().filter(([cp, fg]) => starry(cp, fg)).length
const colOf = i => (i >> 1) % 64, rowOf = i => 2 * Math.floor(i / 128) + (i & 1) // pixels() runs top, bottom, top, bottom along each row of cells
const moonlit = t => pixels(kong(t)).filter((c, i) => cream(c) && colOf(i) > 42).length // cream out on the right, clear of the cap
for (const t of [0, 10, 40, 60, 97, 110]) {
  const look = kong(t), plain = plainK(t), px = pixels(look)
  show(`kongming t=${t}`, look)
  assert.ok(plain.every((c, i) => !dark(c) || px[i] === c), `kongming t=${t}: face untouched`)
  assert.ok(count(look, blue) > 20, `kongming t=${t}: cap on`)
  assert.ok(new Set(px.filter(blue)).size > 8, `kongming t=${t}: the cap is shaded round, not flat`)
  assert.ok(count(look, dark) > plain.filter(dark).length + 15, `kongming t=${t}: beard on`)
}
for (const t of [10, 40]) assert.ok(count(kong(t), feather) > 20, `kongming t=${t}: fan in view`)
assert.ok(new Set(pixels(kong(125)).filter(feather)).size > 20, 'kongming: the feathers are shaded, not flat')
assert.ok(BUSY.kongming(40).cx > 38 && BUSY.kongming(97).cx < 26, 'kongming: walks to each end')
assert.ok(BUSY.kongming(10).persp < -0.3 && BUSY.kongming(60).persp > 0.3, 'kongming: turned the way he walks, as far round as the lean')
assert.ok(BUSY.kongming(0).R > BUSY.kongming(40).R + 3 && BUSY.kongming(60).R > BUSY.kongming(97).R + 3, 'kongming: closer to the screen in the middle than at the ends')
assert.ok(BUSY.kongming(10).nod > 0 && BUSY.kongming(40).nod < 0, 'kongming: looks a touch down while he walks, chin up to the sky')
assert.ok(BUSY.kongming(40).persp > 0 && BUSY.kongming(97).persp < 0, 'kongming: turns back to the open sky behind him')
assert.equal(dipper(kong(40)), 7, 'kongming: from the right end, all seven stars of the Big Dipper, none hidden behind him')
assert.ok(moonlit(97) > 100, 'kongming: from the left end, a full moon out on the right')
assert.ok(pixels(kong(97)).filter((c, i) => dark(c) && colOf(i) > 45 && rowOf(i) > 5 && rowOf(i) < 15).length > 10, 'kongming: the moon wears Twen\'s face')
const red = cells => pixels(cells).filter(c => c === 0xe5484d).length
assert.ok(!red(kong(36)) && red(kong(40)) >= 4, 'kongming: the bowl\'s last stroke gets struck out with a red cross')
assert.ok(BUSY.kongming(40).sky > 0.5 && BUSY.kongming(97).sky < -0.5 && !dipper(kong(97)), 'kongming: one sight at a time: the Dipper (sky > 0.5) from the right end, the moon (sky < -0.5) from the left')
assert.ok(!moonlit(10) && !moonlit(60) && !dipper(kong(10)) && !dipper(kong(60)), 'kongming: the sky only while he looks up')
const clearance = t => { const p = BUSY.kongming(t), bare = paint({ ...p, sky: 0 }, t), him = [], sky = []; kong(t).forEach((row, r) => row.forEach((cell, c) => { if (cell[0] !== 0x20) (cell.join() !== bare[r][c].join() ? sky : him).push([c, 2 * r]) })); return Math.min(...sky.map(([c, y]) => Math.min(...him.map(([hc, hy]) => Math.hypot(hc - c, hy - y))))) } // how close the sky (what sky adds) comes to him, in pixels
assert.ok(clearance(40) >= 8 && clearance(97) >= 8, 'kongming: the Dipper and the moon sit in open sky, at least 8 pixels clear of him')
// The Dipper's lines are traced in order, bowl first, then the handle; two long flat clouds drift past the moon, the upper one leftwards, the lower one rightwards, covering only a little of it.
const traced = t => { const p = BUSY.kongming(t), bare = paint({ ...p, trace: 0 }, t), cols = []; kong(t).forEach((row, r) => row.forEach((cell, c) => { if (cell.join() !== bare[r][c].join()) cols.push(c) })); return cols }
assert.equal(traced(24).length, 0, 'kongming: no lines yet as the Dipper comes out')
assert.ok(traced(30).length > 5 && traced(30).every(c => c >= 13), 'kongming: the lines start at the bowl, 天樞 onwards')
assert.ok(traced(40).length > traced(30).length && traced(40).some(c => c <= 9), 'kongming: and run on down the handle to 搖光')
const cloudy = c => c !== DEF && (c & 255) - (c >> 16) >= 10 && (c & 255) - (c >> 16) <= 40 && ((c >> 16) + ((c >> 8) & 255) + (c & 255)) / 3 > 60
const cloudPx = (t, upper) => pixels(kong(t)).map((c, i) => [c, colOf(i), rowOf(i)]).filter(([c, x, y]) => cloudy(c) && x > 40 && (upper ? y < 10 : y >= 10))
const cloudAt = (t, upper) => { const px = cloudPx(t, upper); return px.reduce((sum, [, x]) => sum + x, 0) / px.length }
assert.ok(cloudAt(83, true) > cloudAt(97, true) + 4 && cloudAt(83, false) < cloudAt(97, false) - 4, 'kongming: the upper cloud drifts right to left, the lower one left to right')
for (const upper of [true, false]) { const px = cloudPx(90, upper), xs = px.map(([, x]) => x), ys = px.map(([, , y]) => y); assert.ok(Math.max(...xs) - Math.min(...xs) + 1 >= 3 * (Math.max(...ys) - Math.min(...ys) + 1), `kongming: the ${upper ? 'upper' : 'lower'} cloud is long and flat`) }
const moonAt = (t, trace) => pixels(paint({ ...BUSY.kongming(t), trace }, t)).filter((c, i) => cream(c) && colOf(i) > 42).length
const bareMoon = moonAt(97, 5) // the clouds long gone
const shown = [81, 83, 86, 90, 94, 97].map(t => moonlit(t) / bareMoon)
assert.ok(shown.every(f => f >= 0.8) && shown.some(f => f < 1), `kongming: the clouds cover a little of the moon, never much (${shown.map(f => f.toFixed(2)).join(' ')})`)
const mid = (t, f) => { let sum = 0, n = 0; pixels(kong(t)).forEach((c, i) => { if (f(c) && rowOf(i) < 8) { sum += colOf(i); n++ } }); return sum / n }
assert.ok(mid(10, cream) > mid(10, blue) + 1 && mid(60, cream) < mid(60, blue) - 1, 'kongming: the cap turns with his head, its plaque round towards the way he faces')
assert.notDeepEqual(pixels(paint({ ...BUSY.kongming(40), wave: 0 }, 40)), pixels(kong(40)), 'kongming: fans while standing still')
const faceLeft = t => { const plain = plainK(t), px = pixels(kong(t)); return plain.filter((c, i) => dark(c) && dark(px[i])).length / plain.filter(dark).length }
const fanAt = t => { let sum = 0, n = 0; pixels(kong(t)).forEach((c, i) => { if (feather(c)) { sum += colOf(i); n++ } }); return sum / n }
for (const t of [125, 133, 148]) show(`kongming t=${t}`, kong(t))
assert.ok(faceLeft(125) < 0.1, 'kongming: the fan covers the face')
assert.ok(faceLeft(133) > 0.15 && BUSY.kongming(133).cx > 38 && faceLeft(148) > 0.15 && BUSY.kongming(148).cx < 26, 'kongming: peeks out right, then left')
assert.ok(BUSY.kongming(133).R > BUSY.kongming(125).R + 3, 'kongming: leans in towards you as he peeks')
assert.ok(Math.abs(fanAt(133) - fanAt(125)) < 2.5 && Math.abs(fanAt(148) - fanAt(125)) < 2.5, 'kongming: the fan stays put while he peeks')
const KONG_T = KONG.reduce((sum, [n]) => sum + n, 0), routine = Array.from({ length: KONG_T }, (_, t) => BUSY.kongming(t))
assert.ok(routine.every(p => Math.max(Math.abs(p.persp), Math.abs(p.nod)) > 0.05), 'kongming: never flat to the screen, always turned or nodding')
const hidden = routine.filter(p => p.hide > 0.5).length
assert.ok(hidden > 0 && hidden < KONG_T / 5, 'kongming: hides only now and then')
for (const t of [0, KONG_T]) { const p = BUSY.kongming(t); assert.ok(p.cx === 36 && p.persp < -0.3 && !p.up && !p.hide, `kongming t=${t}: in the middle, turned right, shifted to keep his near side in frame`) }

// lean-hd: the same lean drawn with quadrant cells, so the box is still 64x16 but the columns are split in two.
const hd = paint(IDLE['lean-hd'](40, 1, -1), 40), lo = paint(IDLE.lean(40, 1, -1), 40)
show('lean-hd, left eye close', hd, true)
assert.equal(hd.length, 16); assert.ok(hd.every(r => r.length === 64))
for (const [cp] of hd.flat()) assert.ok(cp in MASK, `bad hd char ${cp}`)
assert.ok(hd.flat().filter(([cp]) => ![0x20, 0x2580, 0x2584, 0x2588].includes(cp)).length > 20, 'hd uses left/right quadrant cells')
const filled = cells => cells.flat().filter(([cp]) => cp !== 0x20).length
assert.ok(Math.abs(filled(hd) - filled(lo)) < filled(lo) * 0.1, 'hd covers the same cells as lean')
assert.ok(hd.flat().filter(([, fg, bg]) => dark(fg) || dark(bg)).length > 30, 'hd face has features')
assert.ok(paint({ ...mix(IDLE['lean-hd'](40, 0, 0), BUSY.bear(4), 1), hd: 1 }, 4).flat().every(([cp]) => cp in MASK || [0x2a, 0x2b, 0x2e].includes(cp)), 'hd stays hd while busy, stars included')

// /twen idle|busy <move> switches one slot and remembers it in $.store.
const store = {}, hooks = {}
register((event, matcher, hook) => { hooks[event] = hook ?? matcher })
const $ = { store: { get: async k => store[k], set: async (k, v) => { store[k] = v } }, command: { register: async () => {} }, clock: { every: () => {} } }
await hooks['session.start']($, {}, async () => {})
assert.match((await hooks['command.run']($, { args: '' })).text, /idle=lean busy=bear/)
assert.match((await hooks['command.run']($, { args: 'busy dragon' })).text, /Usage/)
assert.match((await hooks['command.run']($, { args: 'idle bear' })).text, /Usage/, 'a busy move does not fit the idle slot')
assert.match((await hooks['command.run']($, { args: 'busy bear' })).text, /busy=bear/)
assert.equal(store.busy, 'bear', 'choice is stored')
assert.match((await hooks['command.run']($, { args: 'idle lean-hd' })).text, /idle=lean-hd/)
assert.equal(store.idle, 'lean-hd', 'the hd lean is a pickable idle move')
assert.ok(Object.values(IDLE).every(f => f(0, 0, 0).R) && Object.values(BUSY).every(f => f(0).R), 'every move answers a pose')

// A busy move counts from the start of the turn: however long Twen idled first, the busy frames come out the same.
const run = async idleTicks => {
  const on = {}, blits = []
  let tick
  register((event, matcher, hook) => { on[event] = hook ?? matcher })
  const $$ = { store: { get: async k => (k === 'busy' ? 'kongming' : undefined), set: async () => {} }, command: { register: async () => {} }, clock: { every: (ms, f) => { tick = f } }, ui: { resolve: () => ({ Raster: x => x }), blit: ({ cells }) => blits.push(cells) } }
  await on['session.start']($$, {}, async () => {})
  on['ui.render']($$, { surface: 'terminal', requestId: 'r', props: { isWorking: false, maxRows: 16, bodyColumns: 64 } }, () => {})
  for (let i = 0; i < idleTicks; i++) tick()
  on['prompt.submit']($$, {}, () => {})
  const from = blits.length
  for (let i = 0; i < 20; i++) tick()
  return blits.slice(from)
}
assert.deepEqual(await run(3), await run(30), 'a busy move starts from the top every turn')

// Surfaces without Raster get an Svg of the same frame, within the Svg size bound, for every move at every tick.
for (const [name, f] of [...Object.entries(IDLE).map(([n, f]) => [n, t => f(t, 1, 1)]), ...Object.entries(BUSY)])
  for (let t = 0; t < 400; t += 7) for (const hd of [0, 1]) {
    const s = svg(paint({ ...f(t), hd, stars: 1, fire: 1 }, t))
    assert.ok(s.length <= 131072 && s.startsWith('<svg') && s.includes('<path'), `${name} t=${t} hd=${hd}: ${s.length} chars`)
  }
{
  const on = {}
  let tick, invalidated = 0
  register((event, matcher, hook) => { on[event] = hook ?? matcher })
  const $$ = { store: { get: async () => undefined }, command: { register: async () => {} }, clock: { every: (ms, f) => { tick = f } }, ui: { resolve: () => ({ Svg: x => x }), invalidate: () => invalidated++ } }
  await on['session.start']($$, {}, async () => {})
  const drawn = on['ui.render']($$, { surface: 'desktop', requestId: 'r', props: { isWorking: false, hasSurvey: false, maxRows: 16, bodyColumns: 64 } }, () => 'engine')
  assert.ok(drawn.source.startsWith('<svg') && drawn.alt, 'the desktop draws Twen as Svg')
  tick(); tick()
  assert.equal(invalidated, 2, 'each tick redraws the Svg band')
}
console.log('ok')
