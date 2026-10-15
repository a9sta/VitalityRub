import { layout, slab } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseList, stepTrack, stepSet, factTable, faqBlock, noticeBlock,
  axisKin, spotIndex, ruralList, dongNameList, guIndex, kinList, pingBand,
  topicLinks, courseTopic,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  ratioWord, longWord, fillWord, concWord, diffWord, axisTalk,
  ANCHOR, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 감싼 네모에서 나온 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    axis: s.axis, axisShort: s.axisShort, brg: s.brg,
    long: s.long, short: s.short, ratio: s.ratio, fill: s.fill,
    guRatioRank: s.guRatioRank, ratioRank: s.ratioRank, longRank: s.longRank, fillRank: s.fillRank,
    twinName: s.twin ? s.twin.name : '', twinDiff: s.twin ? s.twin.diff : 0,
    twinNote: s.twin ? diffWord(s.twin.diff) : '견줄 칸이 없습니다',
    oddName: s.odd ? s.odd.name : '', oddDiff: s.odd ? s.odd.diff : 0,
    oddNote: s.odd ? diffWord(s.odd.diff) : '견줄 칸이 없습니다',
    guAxis: g.guAxis, guRatio: g.guRatio, guLong: g.guLong, guShort: g.guShort,
    longSpot: g.longSpot, longRatio: g.longRatio, boxSpot: g.boxSpot, boxRatio: g.boxRatio,
    widestSpot: g.widestSpot, widestLong: g.widestLong,
    allSpots: counts.spot, guSpotCount: g.spotCount,
    axisNote: axisTalk(s.axis), ratioNote: ratioWord(s.ratio),
    longNote: longWord(s.long), fillNote: fillWord(s.fill), concNote: concWord(g.conc),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 쪽 — 메인 네 시도에서만 낸다 ──────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="lede">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = slab('fact', 'measured', `${esc(s.name)} 땅을 네모로 감싸면`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['누운 쪽', `${esc(s.axis)} — ${esc(axisTalk(s.axis))}`],
      ['긴 변', `${s.long}m — ${esc(longWord(s.long))}`],
      ['짧은 변', `${s.short}m`],
      ['길쭉함', `${s.ratio} — ${esc(ratioWord(s.ratio))}`],
      ['네모를 채운 몫', `${s.fill}% — ${esc(fillWord(s.fill))}`],
      ['결이 가까운 칸', s.twin ? `<a href="/${sd.slug}/${g.slug}/${s.twin.slug}/">${esc(s.twin.name)}</a> ${s.twin.diff}도 차이` : `${esc(g.name)}에 다른 칸이 없습니다`],
      ['결이 어긋난 칸', s.odd ? `<a href="/${sd.slug}/${g.slug}/${s.odd.slug}/">${esc(s.odd.name)}</a> ${s.odd.diff}도 차이` : `${esc(g.name)}에 다른 칸이 없습니다`],
      ['땅', km2(s.area)],
    ]),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '07');

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) far.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const sameSido = [];
  for (const x of sd.gu) {
    if (x.slug === g.slug) continue;
    for (const y of x.spots) sameSido.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 다른 칸`, items: sameSido, pick: 12, anchor: ANCHOR },
    { label: '결이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시도', items: far, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    pingBand(cfg, `${g.name} ${s.name}`, seed),
    courseList(courses, seed, s.name, '02', { full: false }),
    axisKin(sd, g, s, seed, '03'),
    spotIndex(sd, g, seed, s.slug, '04'),
    stepTrack(seed, '05'),
    guIndex(sd, seed, g.slug, '06', { pick: 12 }),
    faqHtml,
    noticeBlock(seed, '08'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="head1-s">출장마사지 홈타이 · ${esc(s.axis)} 쪽으로 누운 땅 · 긴 변 ${s.long}m</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${g.name} ${s.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 쪽에서 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다(강화·가평·양평·연천·기장).
     쪽을 낼 칸이 0이므로 리드·장부·목록을 따로 갈라야 한다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area),
    guAxis: g.guAxis, guRatio: g.guRatio, guLong: g.guLong, guShort: g.guShort,
    leanAxis: g.leanAxis, conc: g.conc, concNote: concWord(g.conc),
    longSpot: g.longSpot || '', longRatio: g.longRatio || 0,
    boxSpot: g.boxSpot || '', boxRatio: g.boxRatio || 0,
    widestSpot: g.widestSpot || '', widestLong: g.widestLong || 0,
    kinCount: g.kinCount,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="lede">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}칸`],
    mode === 'spot' ? ['쪽을 둔 동', `${g.spotCount}칸`]
      : mode === 'rural' ? ['쪽을 둔 동', '없음 — 읍·면만 있는 군입니다']
        : ['멈춘 층', '시군구 — 동 이름은 아래에 적었습니다'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}칸 — 이름으로만 적음(읍 ${g.eupCount}·면 ${g.myeonCount})` : '없음'],
    ['구 전체가 누운 쪽', `${esc(g.guAxis)} — ${esc(axisTalk(g.guAxis))}`],
    ['감싼 네모', `긴 변 ${g.guLong}m · 짧은 변 ${g.guShort}m · 길쭉함 ${g.guRatio}`],
    ['안쪽 칸들의 방향', `${esc(concWord(g.conc))} (몰림 ${g.conc}%)`],
    ['결이 닮은 시군구', g.kin.length ? `${esc(g.kin[0].gu)} ${g.kin[0].diff}도 · ${esc(g.kin[1].gu)} ${g.kin[1].diff}도 외 ${g.kinCount - 2}곳` : '없음'],
    ['땅', km2(g.area)],
  ];
  if (mode === 'spot' && g.longSpot) {
    rows.splice(7, 0,
      ['가장 길쭉한 칸', `<a href="/${sd.slug}/${g.slug}/${g.longSpotSlug}/">${esc(g.longSpot)}</a> ${g.longRatio} · 가장 네모난 칸 <a href="/${sd.slug}/${g.slug}/${g.boxSpotSlug}/">${esc(g.boxSpot)}</a> ${g.boxRatio}`],
      ['긴 변이 가장 긴 칸', `<a href="/${sd.slug}/${g.slug}/${g.widestSpotSlug}/">${esc(g.widestSpot)}</a> ${g.widestLong}m`]);
  }
  const facts = slab('fact', 'measured', `${esc(g.name)} 치수 장부`, factTable(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const steps = stepSet(seed);
  const sidoDeep = [];
  for (const x of sd.gu) for (const y of x.spots) if (x.slug !== g.slug) sidoDeep.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '결이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    ...(sidoDeep.length ? [{ label: `${sd.name} 동으로 바로`, items: sidoDeep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시군구', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '10', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    pingBand(cfg, `${sd.name} ${g.name}`, seed),
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    courseList(courses, seed, g.name, '04', { full: false }),
    kinList(sd, g, seed, '05'),
    faqHtml,
    stepTrack(seed, '07'),
    noticeBlock(seed, '08'),
    guIndex(sd, seed, g.slug, '09', { pick: 20 }),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="head1-s">출장마사지 홈타이 · ${mode === 'spot' ? `동 ${g.spotCount}칸마다 화면이 있습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}칸까지 나갑니다` : `행정동 ${g.dongCount}칸 전부 나갑니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${g.name}에서 부르는 다섯 걸음`, steps, cfg),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions, data } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    avgRatio: sd.avgRatio, areaTxt: km2(sd.area), leanAxis: sd.leanAxis,
    topAxis: data.axisNames[sd.axisHist.indexOf(Math.max(...sd.axisHist))],
    longSpot: sd.longSpot, longRatio: sd.longRatio, boxSpot: sd.boxSpot,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="lede"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = slab('fact', 'measured', `${esc(sd.name)} 치수 장부`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 둔 층', sd.main ? '시군구 밑에 동까지' : '시군구에서 멈춤'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}칸`],
      sd.main ? ['쪽을 둔 동', `${sd.spotCount}칸`] : ['동 이름', '시군구 화면 안 목록에'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}칸 — 시군구 화면에 이름으로만` : '없음'],
      ['가장 흔한 결', `${esc(data.axisNames[sd.axisHist.indexOf(Math.max(...sd.axisHist))])} — ${Math.max(...sd.axisHist)}칸`],
      ['무게를 실은 평균 결', `${esc(sd.leanAxis)} (몰림 ${sd.conc}%)`],
      ['길쭉함 평균', `${sd.avgRatio}`],
      sd.main && sd.longSpot ? ['가장 길쭉한 동', `${esc(sd.longSpot)} ${sd.longRatio}`] : ['여는 시각', `${esc(cfg.hours)} 접수 · ${esc(cfg.pay)} 셈`],
      sd.main && sd.boxSpot ? ['가장 네모난 동', `${esc(sd.boxSpot)} ${sd.boxRatio}`] : ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '06');

  const csLinks = slab('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<ul class="tags">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스에 따라 손이 오래 머무는 자리가 갈립니다. 값표는 ${esc(sd.name)} 전역이 하나입니다.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.ratio - a.s.ratio || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = slab('long', 'elongated', `${esc(sd.name)}에서 가장 길게 누운 동`,
      `<ul class="tags">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${x.s.ratio}배</a></li>`).join('\n')}\n</ul>`,
      '길쭉함이 큰 칸입니다. 같은 동 이름 안에서도 끝과 끝이 멀어 번지를 끝까지 주셔야 합니다. 여기 없는 칸은 시군구를 거쳐 들어가 주십시오.', '03');
  } else {
    pickBlock = slab('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="tags">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}칸</a></li>`).join('\n')}\n</ul>`,
      '행정동 수가 많다는 것은 같은 땅을 더 잘게 쪼개 이름 붙였다는 뜻입니다.', '03');
  }

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const deep = [];
  for (const g of sd.gu) for (const x of g.spots) deep.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} + 코스로`, items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    ...(deep.length ? [{ label: `${sd.name} 동으로 바로`, items: deep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시도', items: far, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    pingBand(cfg, sd.name, seed),
    guIndex(sd, seed, null, '02'),
    pickBlock,
    csLinks,
    courseList(courses, seed, sd.name, '05', { full: false }),
    faqHtml,
    stepTrack(seed, '07'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="head1-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} · 평균 결 ${esc(sd.leanAxis)}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.itemList(`${url}#courselist`, `${sd.name} 코스`, courses.map((c) => ({ name: `${sd.name} ${c.ko}`, url: `${siteUrl}/${sd.slug}/course/${c.slug}/` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
