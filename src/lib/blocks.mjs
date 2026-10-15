import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { slab, dialBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS, diffWord } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function pingBand(cfg, place, seedKey) {
  const h = hash(seedKey, 'pg');
  const lines = [
    `${place}까지라고만 하셔도 됩니다. 남은 자리는 저희가 되읽으며 맞춥니다.`,
    `${place}에 지금 나갈 수 있는지 통화 중에 바로 봐 드립니다.`,
    `${place}${josa(place, '으로/로')} 가는 데 필요한 것은 코스와 시각, 주소 셋입니다.`,
    `${place} 접수를 받는 길은 이 번호 하나뿐입니다. 다른 창구를 열지 않았습니다.`,
  ];
  return `<section class="ping" aria-label="${esc(place)} 예약 문의">
  <p class="ping-p">${esc(at(h, lines))}</p>
  ${dialBtn(cfg, { size: 'l' })}
  <p class="ping-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 = 정의형 목록 ─────────────────────────────────────────
   ★★쪽마다 여덟 가지를 통째로 되풀이하면 그 덩어리가 본문에서 가장 커지고
     동 쪽끼리 겹침이 올라간다. 동·시군구 쪽에서는 **시드로 고른 셋만** 보이고
     나머지는 코스 쪽으로 보낸다. 허브·시도 쪽에서만 전체를 편다. */
export function courseList(courses, seedKey, place, num = '01', { full = true } = {}) {
  const h = hash(seedKey, 'cl');
  const show = full ? courses : shuffle(courses.slice(), h).slice(0, 3);
  const withText = new Set(shuffle(show.map((c) => c.slug), h).slice(0, full ? 2 : 1));
  const list = show.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<dt><a href="/course/${c.slug}/">${esc(c.ko)}</a><span class="fee">${won(c.price)}원</span></dt>
  <dd class="spec">${c.min}분 · 세기 ${esc(c.pressure)} · ${c.oil ? '기름 씁니다' : '기름 안 씁니다'}</dd>
  ${withText.has(c.slug) ? `<dd>${esc(line)}</dd>` : ''}`;
  }).join('\n');
  const short = [
    `${esc(place)}에도 여덟 가지를 모두 들고 갑니다. 빠진 다섯은 <a href="/course/">코스 화면</a>에서, 숫자는 <a href="/price/">요금 화면</a>에서 보십시오.`,
    `${esc(place)} 통화에서 가장 자주 짚히는 셋입니다. <a href="/course/">여덟 가지를 한자리에</a> 모았고 <a href="/price/">값은 따로</a> 두었습니다.`,
    `${esc(place)}이라고 고를 가짓수가 줄지는 않습니다. <a href="/course/">나머지 다섯</a>과 <a href="/price/">전체 값</a>을 함께 두었습니다.`,
    `세기나 길이가 안 맞으시면 <a href="/course/">여덟 가지</a>를 펼쳐 보십시오. 어느 자리든 <a href="/price/">같은 표</a>를 쓰고 ${esc(place)}도 그렇습니다.`,
  ];
  const tail = full
    ? `${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}`
    : at(h, short, 4);
  return slab('course', 'courses', full ? `${esc(place)}까지 들고 가는 여덟 가지` : `${esc(place)}에서 자주 짚히는 셋`,
    `<dl class="menu8">\n${list}\n</dl>
     <p class="slab-x">${tail}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepSet(seedKey) {
  return at(hash(seedKey, 'st'), STEP_SETS);
}
export function stepTrack(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return slab('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="track">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="ledger"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'fq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = slab('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="qna">\n${qa.map((x, i) => `<div><span class="tag" aria-hidden="true">Q${i + 1}</span><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return slab('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="mind">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return slab('longtail', label, heading, `<ul class="tags">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 롱테일 주제 묶음 ──────────────────────────────────────────
   ★★'다른 지역' 한 덩어리로만 링크를 걸면 코스 이름·값 같은 말로 들어오는 길이
     없다. 주제별로 갈라 묶고 묶음마다 앵커 틀을 달리 둔다. */
export function topicLinks(groups, seedKey, num, heading, sub) {
  const h = hash(seedKey, 'tp');
  const body = groups.filter((g) => g.items && g.items.length).map((g, gi) => {
    const picked = (g.pick ? shuffle(g.items, hash(seedKey, 'tp', gi)) : g.items).slice(0, g.pick || g.items.length);
    const li = picked.map((p) => {
      const base = p.labels ? p.labels[parseInt(hash(seedKey, p.href).substr(0, 3), 16) % p.labels.length] : p.label;
      const tpl = g.anchor ? g.anchor[parseInt(hash(seedKey, g.label, base).substr(0, 3), 16) % g.anchor.length] : null;
      return `<li><a href="${p.href}">${esc(tpl ? tpl(base) : base)}</a></li>`;
    }).join('\n');
    return `<div class="way">
      <p class="way-h">${esc(g.label)}</p>
      <ul class="tags">\n${li}\n</ul>
    </div>`;
  }).join('\n');
  return slab('topic', 'ways in', heading, `<div class="ways">${body}</div>`,
    sub || esc(at(h, SEC.ltSub, 6)), num);
}

/** 코스 묶음 — 시도별 코스 쪽으로 가는 롱테일. */
export function courseTopic(sd, courses) {
  return courses.map((c) => ({ label: `${sd.name} ${c.ko}`, href: `/${sd.slug}/course/${c.slug}/` }));
}

/* ── 결이 닮은 칸 ──────────────────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리가 아니라 **누운 각도 차**로
     줄을 세운다. 가장 나란한 칸부터, 끝에 가장 어긋난 칸을 하나 붙인다. */
export function axisKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const diffOf = (o) => { let d = Math.abs(s.brg - o.brg) % 180; return Math.round(d > 90 ? 180 - d : d); };
  const sorted = pool.slice().sort((a, b) => diffOf(a) - diffOf(b) || a.name.localeCompare(b.name, 'ko'));
  const pick = sorted.slice(0, 7);
  const last = sorted[sorted.length - 1];
  if (pick.length && last && !pick.some((x) => x.slug === last.slug)) pick.push(last);
  return slab('kin', 'same grain', `${esc(g.name)}에서 ${esc(s.name)}${josa(s.name, '과/와')} 결이 가까운 칸`,
    `<ul class="plots">\n${pick.map((x) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="p-n">${esc(x.name)}</span><span class="p-s">${diffOf(x)}° · ${esc(x.axisShort)}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ak'), SEC.kinSub)), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="on"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="p-n">${esc(s.name)}</span><span class="p-s">${esc(s.axisShort)} ${s.ratio}</span></a></li>`).join('\n');
  return slab('spotidx', 'places', `${esc(g.name)} 안에서 화면을 낸 ${g.spotCount}칸`,
    `<ul class="plots">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 쪽을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return slab('rural', 'rural', `${esc(g.name)}에 든 ${esc(label)}칸`,
    `<ul class="names">\n${g.rural.map((m) => `<li>${esc(m.name)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return slab('dongidx', 'dong', `${esc(g.name)}에 속한 동 ${g.dongNames.length}칸`,
    `<ul class="names">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num, { pick = 0 } = {}) {
  /* ★★동 쪽에서 시군구를 통째로 되풀이하면(경기는 47곳) 그 목록이 본문에서 가장 큰
     덩어리가 되어 동 쪽끼리 겹침이 올라간다. 깊이 들어온 쪽에서는 시드로 고른 일부만
     걸고 나머지는 시도 쪽으로 보낸다. */
  let list = sd.gu;
  if (pick && sd.gu.length > pick) {
    const keep = new Set(shuffle(sd.gu.map((g) => g.slug), hash(seedKey, 'gi')).slice(0, pick));
    if (currentSlug) keep.add(currentSlug);
    list = sd.gu.filter((g) => keep.has(g.slug));
  }
  const items = list.map((g) => `<li${g.slug === currentSlug ? ' class="on"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="p-n">${esc(g.name)}</span><span class="p-s">${esc(g.guAxisShort)} ${g.guRatio}</span></a></li>`).join('\n');
  const partial = list.length < sd.gu.length;
  return slab('guidx', 'districts', partial ? `${esc(sd.name)} 시군구 가운데 ${list.length}곳` : `${esc(sd.name)} 아래 시군구 ${sd.gu.length}곳`,
    `<ul class="plots">\n${items}\n</ul>${partial ? `\n<p class="slab-x">${esc(sd.name)}의 시군구는 모두 ${sd.gu.length}곳입니다. <a href="/${sd.slug}/">${esc(sd.name)} 화면</a>에 전부 펼쳐 두었습니다.</p>` : ''}`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 결이 닮은 시군구 (길을 거는 용도) ──────────────────────── */
export function kinList(sd, g, seedKey, num) {
  if (!g.kinCount) return '';
  const items = g.kin.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="p-n">${esc(t.gu)}</span><span class="p-s">${t.diff}° · ${esc(t.axis)}</span></a></li>`).join('\n');
  return slab('kin2', 'alike', `${esc(g.name)}${josa(g.name, '과/와')} 누운 쪽이 닮은 시군구`,
    `<ul class="plots">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'kl'), SEC.nearSub)), num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return slab('also', 'more', '이어서 볼 곳',
    `<ul class="tags">
      <li><a href="/area/">닿는 자리 전부</a></li>
      <li><a href="/guide/">처음이라면</a></li>
      <li><a href="/price/">요금</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">기록</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도 아래에 시군구가 있고 수도권과 부산에만 동이 한 겹 더 붙습니다. 읍·면과 그 밖 지역의 동은 목록에 이름으로만 올라 있습니다.');
}

/** 문서·글 쪽에 다는 주제 묶음. 지역 목록 대신 찾는 말로 갈라 건다. */
export function docTopics(ctx, seedKey, num, heading, sub) {
  const { regions, courses } = ctx;
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  return topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 12, anchor: COURSE_ANCHOR },
    { label: '시군구로', items: guList, pick: 14, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seedKey, num, heading, sub);
}
