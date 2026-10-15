/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **누운 방향**이다. 땅을 가장 작은 네모로 감싸고
 *   그 네모가 어느 쪽으로 누웠는지, 얼마나 길쭉한지를 잰다.
 *     누운 결   : 긴 변이 가리키는 방향을 22.5도씩 여덟 갈래로 묶은 것
 *     길쭉함    : 긴 변 ÷ 짧은 변
 *     긴 변     : 감싼 네모의 긴 쪽 길이(m)
 *     채운 몫   : 그 네모를 실제 땅이 얼마나 채우는가(%)
 *     결 짝     : 같은 시군구에서 누운 방향이 가장 비슷한 칸
 *     결 어긋남 : 누운 방향이 가장 많이 틀어진 칸
 *
 *   길이 남북으로 길게 뻗은 동네와 동서로 퍼진 동네는 같은 넓이라도 안에서
 *   움직이는 꼴이 다르다. 관리사가 한쪽 끝에서 들어오면 긴 쪽으로 누운 칸은
 *   반대쪽 끝까지가 멀고, 네모에 가까운 칸은 어디로 들어와도 비슷하다.
 *
 *   ★감싼 네모는 **돌려 가며** 찾는다. 남북으로 반듯한 네모(축에 붙인 가로세로)로
 *     재면 비스듬히 누운 땅이 네모나게 보인다. 볼록 껍질의 변마다 한 번씩 돌려
 *     가장 넓이가 작은 네모를 고른다(회전 캘리퍼스).
 *   앞선 열두 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·
 *   가로세로·둘레·뭉침 정도·안쪽 깊이·매듭점·시도 바깥선까지의 거리·이름 세기·
 *   해의 자리·테두리의 결·다리 수를 썼다. 땅이 누운 방향을 재는 축은 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/** 경위도를 그 자리 기준 미터 평면으로. 작은 땅에서는 이것으로 충분하다. */
function projector(lat0) {
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  return { kx, ky, to: (c) => [c[0] * kx, c[1] * ky] };
}

function ringArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length - 1; i < n; i++) a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return a / 2;
}

/** 볼록 껍질 — 앤드루 단조 사슬 */
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const uniq = [];
  for (const q of p) if (!uniq.length || uniq[uniq.length - 1][0] !== q[0] || uniq[uniq.length - 1][1] !== q[1]) uniq.push(q);
  if (uniq.length < 3) return uniq;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const q of uniq) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  const upper = [];
  for (let i = uniq.length - 1; i >= 0; i--) { const q = uniq[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

/**
 * 가장 작은 넓이로 감싸는 네모 — 회전 캘리퍼스.
 * 껍질의 변마다 그 변이 가로가 되도록 돌려 보고 넓이가 가장 작은 것을 고른다.
 * ★축에 붙인 가로세로로 재면 비스듬히 누운 땅이 네모로 읽힌다. 그래서 돌린다.
 */
function minRect(pts) {
  const h = hull(pts);
  if (h.length < 3) return null;
  let best = null;
  for (let i = 0; i < h.length; i++) {
    const a = h[i], b = h[(i + 1) % h.length];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy);
    if (L < 1e-9) continue;
    const ux = dx / L, uy = dy / L;
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (const p of h) {
      const u = p[0] * ux + p[1] * uy;
      const v = -p[0] * uy + p[1] * ux;
      if (u < minU) minU = u; if (u > maxU) maxU = u;
      if (v < minV) minV = v; if (v > maxV) maxV = v;
    }
    const w = maxU - minU, hh = maxV - minV, ar = w * hh;
    if (!best || ar < best.ar) best = { ar, w, hh, ux, uy };
  }
  if (!best) return null;
  const longer = best.w >= best.hh;
  const len = longer ? best.w : best.hh;
  const wid = longer ? best.hh : best.w;
  // 긴 변이 가리키는 방향 벡터
  const vx = longer ? best.ux : -best.uy;
  const vy = longer ? best.uy : best.ux;
  // 방위각 — 북이 0도, 동이 90도. 방향이 아니라 축이므로 0~180 으로 접는다.
  let brg = deg(Math.atan2(vx, vy));
  while (brg < 0) brg += 180;
  while (brg >= 180) brg -= 180;
  return { len, wid, brg, rectArea: best.ar };
}

/** 22.5도씩 여덟 갈래 — 방향이 아니라 축이라 양쪽 이름을 함께 쓴다. */
const AXIS8 = [
  { to: 11.25, ko: '남북', short: '남북' },
  { to: 33.75, ko: '북북동–남남서', short: '북북동' },
  { to: 56.25, ko: '북동–남서', short: '북동' },
  { to: 78.75, ko: '동북동–서남서', short: '동북동' },
  { to: 101.25, ko: '동서', short: '동서' },
  { to: 123.75, ko: '동남동–서북서', short: '동남동' },
  { to: 146.25, ko: '남동–북서', short: '남동' },
  { to: 168.75, ko: '남남동–북북서', short: '남남동' },
  { to: 180.01, ko: '남북', short: '남북' },
];
function axisOf(brg) {
  for (let i = 0; i < AXIS8.length; i++) if (brg < AXIS8[i].to) return { idx: i === 8 ? 0 : i, ko: AXIS8[i].ko, short: AXIS8[i].short };
  return { idx: 0, ko: '남북', short: '남북' };
}
/** 두 축 사이의 각 차이 — 0~90 */
const axisDiff = (a, b) => { let d = Math.abs(a - b) % 180; return d > 90 ? 180 - d : d; };

/** 축 여러 개의 평균 방향과 몰림 정도 — 각을 두 배로 늘려 원 위에서 더한다. */
function axisMean(list) {
  let sx = 0, sy = 0, w = 0;
  for (const { brg, weight } of list) {
    const t = rad(brg * 2), ww = weight || 1;
    sx += Math.cos(t) * ww; sy += Math.sin(t) * ww; w += ww;
  }
  if (!w) return { brg: 0, conc: 0 };
  const R = Math.hypot(sx, sy) / w;
  let m = deg(Math.atan2(sy, sx)) / 2;
  while (m < 0) m += 180;
  while (m >= 180) m -= 180;
  return { brg: m, conc: R };
}

function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  const pr = projector(lat0);
  let A = 0, X = 0, Y = 0;
  const all = [];
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const pts = ring.map(pr.to);
      const a = ringArea(pts);
      if (!a) return;
      if (idx === 0) for (const p of pts) all.push(p);
      let cx = 0, cy = 0;
      for (let i = 0, n = pts.length - 1; i < n; i++) {
        const f = pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
        cx += (pts[i][0] + pts[i + 1][0]) * f; cy += (pts[i][1] + pts[i + 1][1]) * f;
      }
      cx /= 6 * a; cy /= 6 * a;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(a);
      A += sign; X += cx * sign; Y += cy * sign;
    });
  }
  if (!A || !all.length) return null;
  const mr = minRect(all);
  if (!mr) return null;
  const area = Math.abs(A);
  return {
    area: area / 1e6,                                   // km²
    lng: (X / A) / pr.kx, lat: (Y / A) / pr.ky,
    len: mr.len, wid: mr.wid, brg: mr.brg,
    fill: mr.rectArea ? (area / mr.rectArea) * 100 : 0,
    pts: all, pr,
  };
}

const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const ax = axisOf(st.brg);
  const rec = {
    code: String(p.adm_cd2), name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
    brg: Math.round(st.brg), axis: ax.ko, axisShort: ax.short, axisIdx: ax.idx,
    long: Math.round(st.len), short: Math.round(st.wid),
    ratio: Math.max(1, r1(st.wid ? st.len / st.wid : 1)),
    fill: Math.round(st.fill),
    pts: st.pts,
  };
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  /* 시군구 땅 전체를 감싼 네모 */
  const allPts = [];
  for (const d of list) for (const p of d.pts) allPts.push(p);
  const gr = minRect(allPts);
  const gax = gr ? axisOf(gr.brg) : { ko: '남북', short: '남북', idx: 0 };
  /* 그 안 칸들이 한 방향으로 몰려 있는가 */
  const mean = axisMean(list.map((d) => ({ brg: d.brg, weight: d.area })));
  const mx = axisOf(mean.brg);

  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    guBrg: gr ? Math.round(gr.brg) : 0,
    guAxis: gax.ko, guAxisShort: gax.short, guAxisIdx: gax.idx,
    guLong: gr ? Math.round(gr.len) : 0,
    guShort: gr ? Math.round(gr.wid) : 0,
    guRatio: gr ? Math.max(1, r1(gr.wid ? gr.len / gr.wid : 1)) : 1,
    leanBrg: Math.round(mean.brg), leanAxis: mx.ko, leanShort: mx.short, leanIdx: mx.idx,
    conc: Math.round(mean.conc * 100),
    /* 여덟 갈래 분포 — 홈 화면 줄무늬에 쓴다 */
    axisHist: (() => { const a = new Array(8).fill(0); for (const d of list) a[d.axisIdx] += 1; return a; })(),
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        brg: d.brg, axis: d.axis, axisShort: d.axisShort, axisIdx: d.axisIdx,
        long: d.long, short: d.short, ratio: d.ratio, fill: d.fill,
      };
      g.spots.push(s); spotAll.push(s);
      d.spot = s;
    }
  }
  g.spotCount = g.spots.length;
  g.list = list;
  guAll.push(g);
}

/* ── 같은 시군구 안에서 방향 견주기 ──────────────────────── */
for (const g of guAll) {
  if (g.spots.length < 2) {
    for (const s of g.spots) { s.twin = null; s.odd = null; s.axisRank = 1; }
  } else {
    for (const s of g.spots) {
      let near = null, far = null;
      for (const o of g.spots) {
        if (o.slug === s.slug) continue;
        const d = Math.round(axisDiff(s.brg, o.brg));
        if (!near || d < near.diff) near = { name: o.name, slug: o.slug, diff: d };
        if (!far || d > far.diff) far = { name: o.name, slug: o.slug, diff: d };
      }
      s.twin = near; s.odd = far;
    }
  }
  g.spots.slice().sort((a, b) => b.ratio - a.ratio || a.name.localeCompare(b.name, 'ko'))
    .forEach((s, i) => { s.guRatioRank = i + 1; });
  if (g.spots.length) {
    const byR = g.spots.slice().sort((a, b) => b.ratio - a.ratio);
    g.longSpot = byR[0].name; g.longSpotSlug = byR[0].slug; g.longRatio = byR[0].ratio; g.longAxis = byR[0].axis;
    g.boxSpot = byR[byR.length - 1].name; g.boxSpotSlug = byR[byR.length - 1].slug; g.boxRatio = byR[byR.length - 1].ratio;
    const byL = g.spots.slice().sort((a, b) => b.long - a.long);
    g.widestSpot = byL[0].name; g.widestSpotSlug = byL[0].slug; g.widestLong = byL[0].long;
  }
}

/* ── 누운 방향이 가장 비슷한 시군구 — 이 사이트의 '옆 동네' ── */
{
  const bySido = new Map();
  for (const g of guAll) {
    if (!bySido.has(g.sidoKey)) bySido.set(g.sidoKey, []);
    bySido.get(g.sidoKey).push(g);
  }
  const sidoSlug = (key) => (MAIN[key] || SUB[key]).slug;
  for (const g of guAll) {
    const pool = [];
    for (const o of guAll) {
      if (o === g) continue;
      const same = o.sidoKey === g.sidoKey;
      // 같은 시도를 먼저 보고, 모자라면 다른 시도에서 채운다
      pool.push({ o, same, diff: Math.round(axisDiff(g.guBrg, o.guBrg)) });
    }
    pool.sort((a, b) => (a.same === b.same ? a.diff - b.diff : a.same ? -1 : 1));
    g.kin = pool.slice(0, 8).map(({ o, same, diff }) => ({
      sidoSlug: sidoSlug(o.sidoKey), gu: o.name, slug: o.slug, same, diff, axis: o.guAxisShort,
    }));
    g.kinCount = g.kin.length;
  }
}

/* ── 차례 매기기 ──────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.ratio - a.ratio).forEach((s, i) => { s.ratioRank = i + 1; });
spotAll.slice().sort((a, b) => b.long - a.long).forEach((s, i) => { s.longRank = i + 1; });
spotAll.slice().sort((a, b) => b.fill - a.fill).forEach((s, i) => { s.fillRank = i + 1; });

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allList = [];
  for (const g of gus) for (const d of g.list) allList.push(d);
  const mean = axisMean(allList.map((d) => ({ brg: d.brg, weight: d.area })));
  const mx = axisOf(mean.brg);
  const hist = new Array(8).fill(0);
  for (const d of allList) hist[d.axisIdx] += 1;
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.list;
  }
  const longest = allSpots.slice().sort((a, b) => b.ratio - a.ratio)[0];
  const boxiest = allSpots.slice().sort((a, b) => a.ratio - b.ratio)[0];
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    leanBrg: Math.round(mean.brg), leanAxis: mx.ko, leanShort: mx.short, leanIdx: mx.idx,
    conc: Math.round(mean.conc * 100),
    axisHist: hist,
    avgRatio: allList.length ? r1(allList.reduce((s, d) => s + d.ratio, 0) / allList.length) : 0,
    longSpot: longest ? longest.name : '', longRatio: longest ? longest.ratio : 0,
    boxSpot: boxiest ? boxiest.name : '', boxRatio: boxiest ? boxiest.ratio : 0,
    gu: gus,
  });
}

const rr = spotAll.map((s) => s.ratio).sort((a, b) => a - b);
const ff = spotAll.map((s) => s.fill).sort((a, b) => a - b);
const histAll = new Array(8).fill(0);
for (const g of guAll) for (let i = 0; i < 8; i++) histAll[i] += g.axisHist[i];
const out = {
  version: VERSION,
  source: 'admdongkor 행정동 경계 자료(CC BY 4.0). 원자료는 국가공간정보포털, 배포는 github.com/vuski/admdongkor.',
  built: new Date().toISOString().slice(0, 10),
  axis: '누운 방향 — 가장 작게 감싼 네모의 긴 변이 가리키는 쪽, 길쭉함, 채운 몫',
  method: '행정동 경계의 바깥 테두리를 그 자리 기준 미터 평면으로 옮기고 볼록 껍질을 구한 뒤, 껍질의 변마다 한 번씩 돌려 가며 넓이가 가장 작은 네모를 찾았다(회전 캘리퍼스). 그 네모의 긴 변이 가리키는 방위를 0~180도로 접어 22.5도씩 여덟 갈래로 묶었고, 긴 변을 짧은 변으로 나눈 값을 길쭉함으로 삼았다.',
  coverageFrom: '서울·인천·경기·부산에서는 동 하나마다 화면을 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구에서 끊는다. 읍과 면은 화면 없이 시군구 목록에 이름으로만 올린다.',
  axisNames: AXIS8.slice(0, 8).map((x) => x.short),
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    ratioMin: rr[0], ratioMid: rr[rr.length >> 1], ratioMax: rr[rr.length - 1],
    fillMid: ff[ff.length >> 1],
    longName: spotAll.slice().sort((a, b) => b.ratio - a.ratio)[0].name,
    boxName: spotAll.slice().sort((a, b) => a.ratio - b.ratio)[0].name,
    longestName: spotAll.slice().sort((a, b) => b.long - a.long)[0].name,
    longestM: spotAll.slice().sort((a, b) => b.long - a.long)[0].long,
    hist: histAll,
    topAxis: AXIS8[histAll.indexOf(Math.max(...histAll))].short,
    topAxisN: Math.max(...histAll),
    featAll: geo.features.length,
  },
  sido,
};
/* 좌표 꾸러미는 내보내지 않는다 — 파일만 커진다 */
fs.writeFileSync(OUT, JSON.stringify(out, (k, v) => (k === 'pts' || k === 'pr' ? undefined : v)));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`길쭉함 min ${C.ratioMin} · 중앙 ${C.ratioMid} · max ${C.ratioMax}(${C.longName}) · 가장 네모난 칸 ${C.boxName}`);
console.log(`긴 변 최대 ${C.longestM}m(${C.longestName}) · 네모를 채운 몫 중앙 ${C.fillMid}%`);
console.log(`여덟 갈래 분포 ${AXIS8.slice(0, 8).map((x, i) => `${x.short} ${C.hist[i]}`).join(' · ')} → 가장 흔한 결 ${C.topAxis}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 누운 결 ${s.leanShort.padEnd(4)} 몰림 ${String(s.conc).padStart(3)}% · 길쭉함 평균 ${s.avgRatio}`);
