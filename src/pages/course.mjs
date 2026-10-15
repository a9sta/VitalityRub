import { layout, slab } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factTable, faqBlock, stepTrack, stepSet, noticeBlock, pingBand, courseList, topicLinks, courseTopic } from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, axisTalk } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않는다. 1,232 × 8 이면 아홉 쪽이 넘는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 쪽이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름을 씁니다. 마치고 씻으실 수 있는 시각인지만 한번 보시고 고르십시오.',
  false: '기름이 들어가지 않습니다. 옷 그대로 받고 끝나면 바로 나가셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 하면서 맞춥니다. 받아 보시는 동안 어느 선이 맞는지 서로 알게 됩니다.',
  '표에 적은 등급은 시작점일 뿐입니다. 아프면 참지 마시고 바로 짚어 주십시오.',
  '같은 힘도 사람마다 다르게 받아들입니다. 표의 글자보다 그날 몸 상태가 앞섭니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 고르시는 분은 대개 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 맞춰 둔 코스입니다. 사정이 다르면 통화 중에 바꿔 드립니다.`,
  (c) => `${c.for} 이쪽이 맞습니다. 정하고서 바꾸셔도 되고 셈은 마지막에 받은 코스로 합니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="lede">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = slab('fact', 'course', `${esc(c.ko)} 한눈에 보기`,
    factTable([
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — 어느 지역이든 같음`],
      ['세기', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['준비물', c.oil ? '수건 두 장에 누울 자리' : '누울 자리와 수건 한 장'],
      ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)} · 도착 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = slab('cmp', 'compare', '나머지와 같이 놓고 보면',
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="now"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '오래 받는 것과 세게 받는 것은 별개입니다. 길이 칸과 세기 칸을 따로 보십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '04');

  const bySido = regions.map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const others2 = courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: x.ko, href: `/course/${x.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${c.ko}${josa(c.ko, '을/를')} 지역에서`, items: bySido, anchor: COURSE_ANCHOR },
    { label: '다른 코스', items: others2, anchor: COURSE_ANCHOR },
    { label: '시군구로 바로', items: guList, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '06', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    pingBand(cfg, c.ko, seed),
    compare,
    stepTrack(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="head1-s">${c.min}분 ${won(c.price)}원 · 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const openLines = [
    `${sd.name} 안에서는 ${c.ko}에 매기는 값이 한 가지뿐입니다. ${c.min}분에 ${won(c.price)}원이고, 가깝다고 빼거나 멀다고 더 받지 않습니다.`,
    `${sd.name} 어느 자리에서 부르셔도 ${c.ko}에 담기는 내용은 같습니다. 달라지는 것은 닿기까지 걸리는 시간뿐입니다.`,
    `${sd.name}에서 오는 ${c.ko} 문의도 같은 번호에서 받습니다. ${c.min}분 ${won(c.price)}원입니다.`,
  ];
  const second = sd.main
    ? `${sd.name}에서는 동 ${sd.spotCount}칸이 저마다 화면을 가집니다. 사시는 칸을 누르면 그 땅이 어느 쪽으로 누웠는지, 긴 변이 몇 미터인지가 나옵니다. 번지를 어디까지 불러 드려야 하는지 가늠하실 때 쓰시면 됩니다.`
    : `${sd.name}${josa(sd.name, '은/는')} 시군구 ${sd.gu.length}곳에서 층을 끊었습니다. 동 이름은 그 안 목록에 있으니 통화에서 그대로 불러 주시면 됩니다.`;

  const open = `<div class="lede">
  <p>${esc(at(h, openLines, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = slab('fact', 'course', `${esc(sd.name)}에서 받는 ${esc(c.ko)}`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['쪽을 둔 층', sd.main ? `시군구 ${sd.gu.length}곳 밑에 동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`],
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — ${esc(sd.name)} 어디나 같음`],
      ['세기와 결', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['이 지역 평균 결', `${esc(sd.leanAxis)} — ${esc(axisTalk(sd.leanAxis))}`],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '03');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 쪽을 함께 걸어 얇은 쪽이 생기지 않게 한다. */
  const guHere = sd.gu.map((g) => ({ label: `${g.name}`, href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const otherCourse = courses.filter((x) => x.slug !== c.slug)
    .map((x) => ({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` }));
  const sameCourse = regions.filter((r) => r.slug !== sd.slug)
    .map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} 다른 코스`, items: otherCourse, anchor: COURSE_ANCHOR },
    { label: `${c.ko}${josa(c.ko, '을/를')} 다른 지역에서`, items: sameCourse, anchor: COURSE_ANCHOR },
    { label: `${sd.name} 시군구`, items: guHere, pick: 16, anchor: ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동으로 바로`, items: deepHere, pick: 14, anchor: ANCHOR }] : []),
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '05', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    pingBand(cfg, `${sd.name} ${c.ko}`, seed),
    courseList(courses, seed, sd.name, '02', { full: false }),
    faqHtml,
    stepTrack(seed, '04'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="head1-s">${c.min}분에 ${won(c.price)}원 · 출장마사지 홈타이 방문</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
