import { layout, slab, dialBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseList, stepTrack, stepSet, factTable, faqBlock, noticeBlock,
  longtail, pingBand, siteLinks, topicLinks, courseTopic, docTopics,
} from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, axisTalk } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts, data } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="hero" aria-label="첫 안내">
  <p class="hero-sl">${esc(cfg.brand.slogan)}</p>
  <p class="hero-p">들르실 매장이 없습니다. 걸어 주시면 관리사가 가방을 들고 그 주소로 갑니다. 수도권과 부산은 동 하나하나에 화면을 냈고, 대전·대구·울산과 지정한 시·군은 시군구에서 층을 끊었습니다.</p>
  ${dialBtn(cfg, { size: 'l' })}
  <dl class="hero-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>밤에도 끊기지 않음</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>셈은 마치고 한 번</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>이 안에 문 앞입니다</dd></div>
    <div><dt>동 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}곳 아래로</dd></div>
  </dl>
</section>`;

  /* ★지역 고르기 — 이름을 두 칸으로 늘어놓지 않는다. 시도마다 그 안 동들이
     어느 쪽으로 누웠는지를 여덟 칸 막대로 깔고 이름을 그 위에 얹는다. */
  const rows = [...main, ...sub].map((r) => {
    const mx = Math.max(...r.axisHist, 1);
    const topIdx = r.axisHist.indexOf(Math.max(...r.axisHist));
    const bars = r.axisHist.map((n, i) =>
      `<i class="${i === topIdx ? 'top' : ''}" style="height:${Math.max(8, Math.round((n / mx) * 100))}%"></i>`).join('');
    return `<li class="${r.main ? 'deep' : 'sub'}"><a href="/${r.slug}/">
      <span class="rose-top"><b>${esc(r.name)}</b><span class="meta">${r.main ? `동 ${r.spotCount}칸` : `시군구 ${r.gu.length}곳`} · 가장 흔한 결 ${esc(data.axisNames[topIdx])}</span></span>
      <span class="bars">${bars}</span>
    </a></li>`;
  }).join('\n');
  const areaBlock = slab('area', 'where', '어느 쪽 땅에 계십니까',
    `<ul class="rose">${rows}</ul>
     <p class="rose-ax" aria-hidden="true">${data.axisNames.map((n) => `<span>${esc(n)}</span>`).join('')}</p>
     <p class="rose-key">막대 여덟 칸은 그 지역 행정동이 어느 쪽으로 누웠는지를 센 것입니다. 왼쪽이 남북, 가운데가 동서, 오른쪽으로 갈수록 다시 남북으로 돌아옵니다.
       짙은 막대가 가장 많은 갈래입니다. 흐린 줄은 시군구에서 멈춘 지역이고, 층이 달라도 받는 번호와 값표는 하나입니다.
       <a href="/area/">닿는 자리를 한 장에</a> 펼쳐 두었습니다.</p>`,
    '층이 둘로 갈린 것은 적어 둔 깊이가 다를 뿐입니다. 나가는 지역을 줄인 것이 아닙니다.', '01');

  const whyBlock = slab('why', 'method', '왜 누운 방향을 재 두나요?',
    `<div class="lede">
      <p>동 쪽을 열면 그 땅이 <strong>어느 쪽으로 누웠고 얼마나 길쭉한지</strong>가 적혀 있습니다. 가장 길게 늘어난 칸은 ${esc(counts.longName)}${josa(counts.longName, '으로/로')} ${counts.ratioMax}배이고, 가장 네모난 칸은 ${esc(counts.boxName)}입니다. 쪽을 둔 ${counts.spot}칸의 한가운데 값은 ${counts.ratioMid}배입니다.</p>
      <p>이 숫자를 적어 두는 이유는 하나입니다. 길게 누운 동네는 같은 이름 안에서도 끝과 끝이 멉니다. 긴 변이 가장 긴 칸은 ${esc(counts.longestName)}${josa(counts.longestName, '으로/로')} ${counts.longestM}m입니다. 그런 자리에서는 <strong>동 이름만으로 출발하면 반대쪽 끝에서 다시 돌아 들어오게 됩니다.</strong> 접수할 때 번지를 끝까지 여쭙는 까닭입니다.</p>
      <p>전국 행정동 ${counts.featAll}곳의 경계를 각도를 바꿔 가며 감싸 본 값이고, 같은 방식으로 다시 재면 같은 숫자가 나옵니다. 어떻게 쟀는지는 <a href="/magazine/how-we-measure-tilt/">이 글에 풀어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = slab('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="notes">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="slab-x"><a href="/magazine/">기록 전부 보기</a></p>`,
    '체험담이 아닙니다. 읽어 두시면 통화가 짧아지는 것만 모았습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 자리'), 6, '06');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseList(courses, seed, '부르시는 자리', '03'),
    stepTrack(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    topics,
    pingBand(cfg, '지금 계신 자리', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="head1-s">서울·인천·경기·부산 동 ${counts.spot}칸 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 걸음', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="lede">
  <p>쪽을 둔 자리를 한 화면에 모았습니다. 시군구 ${counts.gu}곳과 동 ${counts.spot}칸이 있습니다. 읍·면 ${counts.rural}칸은 쪽만 없고 받는 것도 나가는 것도 같습니다.</p>
  <p>수도권과 부산에서는 동을 하나씩 눌러 들어가실 수 있고, 나머지는 시군구 화면 안에 동 이름을 적어 두었습니다. 깊이를 둘로 가른 것은 문의가 몰리는 쪽만 더 잘게 쪼갰기 때문입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => slab(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}칸` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="plots">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="p-n">${esc(g.name)}</span><span class="p-s">${esc(g.guAxisShort)} ${g.guRatio}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}에서는 시군구를 먼저 짚으셔야 그 밑의 동이 보입니다. 오른쪽 숫자는 그 시군구 땅의 결과 길쭉함입니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구가 마지막입니다. 행정동 ${r.dongCount}칸 이름은 시군구 화면마다 적어 두었습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '90');

  const body = [open, pingBand(cfg, '사시는 자리', seed), blocks, faqHtml, stepTrack(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `닿는 자리 <span class="head1-s">시군구 ${counts.gu}곳과 동 ${counts.spot}칸을 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '닿는 자리', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 나가는 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '사시는 자리에서 부르는 다섯 걸음', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="lede">
  <p>여덟 가지입니다. 정하실 것은 세 가지입니다 — 세기와 길이, 그리고 기름. 나머지는 통화에서 맞춥니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분이고 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 오래 받는다고 세게 받는 것이 아니고, 비싸다고 더 나은 것도 아닙니다.</p>
</div>`;

  const table = slab('all', 'table', '여덟 가지를 한자리에',
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '값이 낮은 것부터 세웠습니다. 어느 자리에서 부르셔도 같은 표를 씁니다.', '01');

  const pickBy = slab('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="notes">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '고른 뒤에 바꾸셔도 됩니다. 값은 마지막에 받으신 코스로 매깁니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [open, table, pickBy, pingBand(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한자리에 모았습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="head1-s">세기와 길이, 기름 여부로 줄 세우기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`), desc: clampDesc(`코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한자리에 모았습니다.`), listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/course/`, cfg, name: `${cfg.brand.ko} 코스 ${courses.length}가지`, desc: clampDesc(`세기와 길이, 기름 여부로 갈라 놓은 출장마사지 홈타이 코스 ${courses.length}가지.`), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 요금 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="lede">
  <p>표 하나로 끝입니다. 이 표에 없는 돈은 어떤 명목으로도 청구하지 않습니다.</p>
  <p>길 건너든 한 시간을 달리는 읍내든 코스가 같으면 값이 같습니다. 멀리 가는 부담은 저희가 집니다.</p>
</div>`;

  const table = slab('tbl', 'prices', '코스별 기본 길이와 값',
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">값</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 값은 견주어 보시라고 붙인 것입니다. 실제로 분을 쪼개어 받지는 않습니다.', '01');

  const noExtra = slab('nox', 'never', '붙지 않는 것',
    `<ul class="mind">
      <li>차비 — 얼마나 멀리 가든 셈에 넣지 않습니다.</li>
      <li>심야 할증 — 한밤중에 부르셔도 표가 그대로입니다.</li>
      <li>명절·휴일 할증 — 달력에 따라 값이 오르지 않습니다.</li>
      <li>앞돈 — 예약금도 보증금도 두지 않습니다.</li>
      <li>취소 수수료 — 일정을 바꾸거나 물러도 비용이 없습니다.</li>
      <li>주차비 — 저희가 냅니다.</li>
    </ul>`,
    '돈부터 보내라는 연락이면 저희가 아닙니다.', '02');

  const pay = slab('how', 'payment', '값은 어떻게 내나요?',
    factTable([
      ['내는 때', '마치고 그 자리에서'],
      ['수단', '현금과 카드 — 어느 쪽이든 같은 값'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받을 때', '접수할 때 정하면 늘어난 만큼만 붙습니다'],
      ['두 분이 받을 때', '인원수만큼 계산합니다. 묶음 할인이 없습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '04');

  const body = [open, table, noExtra, pay, pingBand(cfg, '값 확인', seed), faqHtml, docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`요금 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 값입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 마친 뒤 현금이나 카드로 받습니다.`),
      h1: `요금 <span class="head1-s">${won(sorted[0].price)}원부터 · 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '요금', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 값`, desc: clampDesc(`코스별 기본 길이와 값입니다. ${won(sorted[0].price)}원부터입니다.`), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 처음이라면 ──────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="lede">
  <p>처음 불러 보시는 분을 생각하며 적었습니다. 통화 한 번으로 끝나는 일이라 길게 읽으실 것이 없습니다.</p>
</div>`;

  const what = slab('need', 'ready', '무엇을 두고 기다리면 되나요?',
    `<ul class="mind">
      <li>누울 자리 — 바닥이든 침대든 상관없습니다.</li>
      <li>수건 두 장 — 쓰시던 것으로 충분하고 기름 없는 코스라면 한 장입니다.</li>
      <li>방 한 칸 — 문만 닫히면 식구가 함께 계셔도 됩니다.</li>
    </ul>
    <p class="slab-x">접이식 매트와 기름, 데울 돌은 관리사가 가방에 넣어 옵니다. 장을 보실 것이 없습니다.</p>`,
    null, '01');

  const timing = slab('when', 'hours', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 시각을 따지지 않습니다`],
      ['도착', `보통 ${esc(cfg.arrive)}, 긴 쪽 끝이면 더 걸립니다`],
      ['시간 옮기기', '언제든 됩니다. 비용이 붙지 않습니다'],
      ['취소', '관리사가 문 앞이면 그 사실만 알려 주십시오'],
      ['몰리는 때', '금요일과 토요일 밤'],
      ['빈 때', '주중 낮 — 거의 바로 나갑니다'],
    ]), null, '02');

  const refuse = slab('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="mind">
      <li>성적인 말이 나올 때 — 그 자리에서 통화를 끊습니다.</li>
      <li>열이 있거나 상처가 부어 있을 때 — 날짜를 미뤄 드립니다.</li>
      <li>주소 끝자리를 끝내 안 주실 때 — 누가 어느 길로 갈지 정할 수 없습니다.</li>
      <li>관리사 휴대전화 번호를 달라고 하실 때.</li>
      <li>진료가 먼저로 보일 때 — 병원부터 권합니다.</li>
      <li>만 열아홉 살이 안 되셨을 때.</li>
    </ul>`,
    '못 받게 된 경우에 비용이 발생하지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 자리'), 6, '05');

  const body = [open, what, timing, stepTrack(seed, '04'), refuse, pingBand(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('처음이라면 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 시각, 못 받는 경우, 값 내는 법을 차례로 적었습니다.'),
      h1: `처음이라면 <span class="head1-s">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '처음이라면', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부르실 때 거치는 다섯 걸음', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다.'), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const open = `<div class="lede">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 없이 방문만 하는 곳입니다. 업소를 늘어놓고 연결해 주는 중개가 아니라 저희가 받고 저희가 나갑니다.</p>
  <p>이름은 몸의 기운(vitality)과 손으로 문지르는 일(rub)을 그대로 붙인 것입니다. 하는 일이 그 두 단어를 넘지 않는다는 뜻입니다.</p>
</div>`;

  const line = slab('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="mind">
      <li>합니다 — 손으로 굳은 근육을 풀어 드리는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 꼴로도 두지 않습니다.</li>
      <li>안 합니다 — 진단과 치료. 의료기관이 할 일입니다.</li>
      <li>안 받습니다 — 만 열아홉 살에 못 미치는 분.</li>
      <li>안 싣습니다 — 후기와 별점. 지어낸 글을 가려낼 방법이 없습니다.</li>
      <li>안 올립니다 — 인물 사진. 찍은 것과 실제가 어긋나는 일이 잦습니다.</li>
      <li>안 받습니다 — 선입금. 먼저 받는 돈이 없습니다.</li>
    </ul>`, null, '01');

  const how = slab('data', 'sources', '누운 방향은 어떻게 잰 건가요?',
    `<div class="lede">
      <p>공개된 행정동 경계를 전국 ${counts.featAll}곳 모두 읽어, 각 땅의 바깥 테두리를 <strong>각도를 바꿔 가며 감싸 보았습니다.</strong> 그렇게 그린 네모 가운데 넓이가 가장 작은 것을 고르고, 그 네모의 긴 변이 가리키는 쪽을 누운 방향으로 적었습니다.</p>
      <p>지도를 그대로 놓고 가로세로를 재면 비스듬히 누운 땅이 네모로 읽힙니다. 돌려서 재는 까닭이 그것입니다. 긴 변을 짧은 변으로 나눈 값이 길쭉함인데, 쪽을 둔 ${counts.spot}칸에서 ${counts.ratioMin}배부터 ${counts.ratioMax}배까지 벌어지고 한가운데가 ${counts.ratioMid}배입니다.</p>
      <p>여덟 갈래로 묶어 세어 보면 가장 흔한 결은 ${esc(counts.topAxis)}${josa(counts.topAxis, '으로/로')} ${counts.topAxisN}칸입니다. 감싼 네모를 땅이 채우는 몫은 한가운데가 ${counts.fillMid}%인데, 이 값이 낮을수록 가장자리가 깊이 파인 모양입니다.</p>
      <p>이 값은 행정 경계의 모양일 뿐 도로가 어떻게 났는지는 보지 않습니다. 길쭉한 땅이라고 반드시 길도 길게 난 것은 아닙니다. 그 점을 알고 쓰셔야 합니다.</p>
    </div>
    ${factTable([
      ['밑자료 출처', esc(data.source)],
      ['자료 판본', esc(data.version)],
      ['재는 값', esc(data.axis)],
      ['계산 절차', esc(data.method)],
      ['화면을 내는 기준', esc(data.coverageFrom)],
      ['쪽을 둔 단위', `시도 ${counts.sido} · 시군구 ${counts.gu} · 동 ${counts.spot}`],
      ['쪽이 없는 단위', `읍 ${counts.eup}칸 · 면 ${counts.myeon}칸 — 목록에 이름으로만`],
      ['가장 길쭉한 칸', `${esc(counts.longName)} ${counts.ratioMax}배`],
      ['가장 네모난 칸', `${esc(counts.boxName)} ${counts.ratioMin}배`],
      ['긴 변이 가장 긴 칸', `${esc(counts.longestName)} ${counts.longestM}m`],
    ])}`, null, '02');

  const body = [open, line, how, pingBand(cfg, '문의', seed), docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}은 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}이 하는 일과 하지 않는 일, 그리고 지역 쪽의 누운 방향을 어떤 자료로 어떻게 쟀는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="head1-s">지키는 선과 재는 방법</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
      jsonld: [S.aboutPage({ url: `${siteUrl}/company/`, siteUrl, title: title.page(`${cfg.brand.ko}은 어떤 곳인가`), desc: clampDesc(`${cfg.brand.ko}이 하는 일과 하지 않는 일, 누운 방향을 재는 방식.`) })],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (이 약관이 정하는 것)', '이 약관은 바이탈리티럽(아래에서 "회사")이 손님 댁으로 나가 제공하는 방문 관리에 관하여, 이용 조건과 절차 그리고 양쪽이 지는 책임을 적어 둔 것입니다.'],
  ['제2조 (접수 창구)', '접수는 화면에 적힌 번호로 걸어 주시는 통화로만 받습니다. 이 번호는 중계되는 번호라서 손님 번호가 관리사 쪽에 그대로 전달되지 않습니다. 채팅, 게시판, 전자우편으로 들어오는 접수는 처리하지 않습니다.'],
  ['제3조 (해 드리는 일의 범위)', '회사는 손님이 지정한 장소로 관리사를 보내어 손으로 굳은 근육을 풀어 드립니다. 병을 가려내거나 고치는 일은 하지 않으며, 성적인 서비스 역시 어떤 형태로도 제공하지 않습니다.'],
  ['제4조 (이용 가능 연령)', '만 19세 이상인 분만 이용하실 수 있습니다. 나이가 그에 미치지 못하면 보호자가 동행하더라도 접수를 받지 않습니다.'],
  ['제5조 (누운 방향 수치의 성격)', '화면에 적힌 누운 쪽, 길쭉함, 긴 변과 짧은 변, 네모를 채운 몫은 공개된 행정동 경계를 기계로 돌려 가며 계산한 값입니다. 도로 사정이나 실제 이동 시간을 보장하지 않으며, 어느 변으로 들어가야 할지 가늠해 보시는 참고 자료일 뿐입니다.'],
  ['제6조 (값과 치르는 방법)', '값은 요금 화면과 같으며 지역에 따라 오르내리지 않습니다. 셈은 관리를 마친 그 자리에서 현금이나 카드로 합니다. 예약금이나 보증금처럼 앞서 받는 돈은 어떤 명목으로도 두지 않습니다.'],
  ['제7조 (일정 변경과 취소)', '관리사가 출발하기 전이라면 언제든 시간을 바꾸시거나 없던 일로 하실 수 있고 위약금이 붙지 않습니다. 이미 문 앞에 닿은 뒤라면 그 사실만 바로 알려 주시면 됩니다.'],
  ['제8조 (접수를 거절하거나 중단하는 사유)', '아래 가운데 하나에 해당하면 회사는 접수를 거절하거나 진행 중인 관리를 중단할 수 있습니다. 1. 성적인 서비스를 요구하시는 경우. 2. 관리사에게 거친 말이나 힘을 쓰거나 사적인 연락처를 요구하시는 경우. 3. 방문할 주소를 끝까지 알려 주지 않으시는 경우. 4. 열이 있거나 아물지 않은 상처가 있어 관리가 적절하지 않은 경우.'],
  ['제9조 (손님이 준비해 주실 것)', '관리를 받으실 자리와 수건을 마련해 주시고, 진행에 영향을 줄 수 있는 몸 상태를 접수 통화에서 알려 주셔야 합니다. 열을 쓰는 코스라면 감각이 무딘 부위가 있는지를 특히 먼저 말씀해 주셔야 합니다.'],
  ['제10조 (후기와 평점을 두지 않음)', '회사는 후기와 평점을 수집하지 않고 화면에 올리지도 않습니다. 이 사이트에 적힌 어떤 문장도 특정 손님의 경험을 옮겨 적은 것이 아닙니다.'],
  ['제11조 (중단된 경우의 값 계산)', '손님의 요청이나 몸 상태 때문에 중단한 경우에는 지나간 시간만큼만 계산합니다. 시작한 지 10분이 되지 않았다면 받지 않습니다. 제8조 제1호를 이유로 중단한 경우에는 그 시점까지 계산합니다.'],
  ['제12조 (책임의 범위)', '관리 과정에서 회사의 과실로 손해가 생겼다면 회사가 배상합니다. 미리 알려 주지 않으신 몸 상태에서 비롯한 손해와, 천재지변이나 통신 장애로 늦어진 일에는 책임을 지지 않습니다.'],
  ['제13조 (약관의 개정)', '약관을 고칠 때에는 사이트에 먼저 올리고 올린 날부터 적용합니다. 개정 뒤에 접수하시면 새 내용에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="lede"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 걸어 주신 때에 아래 내용에 동의하신 것으로 봅니다.</p></div>`,
    slab('terms', 'terms', '전문', `<div class="clause">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    pingBand(cfg, '약관 문의', 'terms'),
    docTopics(ctx, 'terms', '11', esc(at(hash('terms', 'dt'), SEC.topicHead, 8)), esc(at(hash('terms', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 문과 제공 범위, 값과 결제, 옮기기와 접기를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="head1-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 받아 적는 항목', '접수 통화에서 적어 두는 것은 넷입니다 — 찾아갈 주소, 연락이 닿는 번호, 고르신 코스, 원하시는 시각. 이름과 생년월일, 주민등록번호는 묻지도 적지도 않습니다.'],
  ['2. 쓰임새', '적어 둔 내용은 관리사를 정하고 출발과 도착을 알려 드리는 데에만 씁니다. 끝난 뒤에 광고 문자를 보내거나 저희 쪽에서 먼저 연락드리는 일이 없습니다.'],
  ['3. 번호를 다루는 방식', '화면의 번호는 중계되는 번호입니다. 그래서 손님 번호가 관리사 휴대전화에 그대로 찍히지 않습니다.'],
  ['4. 보관 기간', '방문이 문제없이 끝나면 그날 안에 지웁니다. 다툼이 있었던 건만 마무리될 때까지 따로 보관합니다.'],
  ['5. 제3자 제공과 위탁', '외부 사업자에게 넘기거나 맡기지 않습니다. 법령에 근거한 수사기관의 적법한 요청이 있을 때만 예외로 둡니다.'],
  ['6. 자동 수집 장치', '이 사이트는 미리 만들어 둔 파일을 그대로 내보내기만 합니다. 로그인도 장바구니도 댓글도 없고, 광고 추적이나 방문자 분석 스크립트를 넣지 않았습니다. 쿠키 역시 쓰지 않습니다.'],
  ['7. 손님의 권리', '저희가 가진 내용을 알려 달라거나 지워 달라고 요청하실 수 있습니다. 같은 번호로 걸어 주시면 그 통화에서 바로 처리합니다.'],
  ['8. 담당자 표시', '사업자 정보가 확정되면 이 항목과 화면 맨 아래에 함께 올립니다. 그때까지는 사이트의 번호가 창구 노릇을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="lede"><p>내용이 짧습니다. 받아 적는 항목 자체가 넷뿐입니다.</p></div>`,
    slab('pp', 'privacy', '전문', `<div class="clause">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    pingBand(cfg, '개인정보 문의', 'privacy'),
    docTopics(ctx, 'privacy', '11', esc(at(hash('privacy', 'dt'), SEC.topicHead, 8)), esc(at(hash('privacy', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 적는 항목과 쓰는 데, 두는 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="head1-s">적어 두는 항목이 넷입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 기록 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="lede"><p>부르기 전에 알아 두면 통화가 짧아지는 것만 적어 둡니다. 감상이나 점수는 올리지 않습니다.</p></div>`,
    slab('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="notes">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS 로도 나갑니다.', '01'),
    pingBand(cfg, '접수', 'magazine'),
    docTopics(ctx, 'magazine', '11', esc(at(hash('magazine', 'dt'), SEC.topicHead, 8)), esc(at(hash('magazine', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('누운 방향 기록'),
      desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적어 두었습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `누운 방향 기록 <span class="head1-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '기록', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('누운 방향 기록'), desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적어 두었습니다.`), listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '누운 방향 기록', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="stamp"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 누운 방향 기록</p>`,
    `<article class="read">${html}</article>`,
    pingBand(cfg, '접수', p.slug),
    slab('more', 'next', '함께 읽을 글',
      `<ul class="notes">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    docTopics(ctx, p.slug, '11', esc(at(hash(p.slug, 'dt'), SEC.topicHead, 8)), esc(at(hash(p.slug, 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '기록', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="lede"><p>그 주소에 쪽이 없습니다. 주소가 바뀌었거나 처음부터 없던 자리입니다. 아래에서 다시 짚어 주십시오.</p></div>`,
    slab('back', 'back', '여기서 다시',
      `<ul class="tags">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">닿는 자리</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">요금</a></li>
        <li><a href="/guide/">처음이라면</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    pingBand(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 쪽이 없습니다. 아래에서 다시 짚어 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
