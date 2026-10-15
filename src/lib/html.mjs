import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { TILTLOGO } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **dialBtn() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 * ★머리표와 버튼은 전부 18도 기울여 자른다. 이 사이트가 재는 값이 그것이다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#0E2A2B">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/vtr.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="skipto" href="#main">본문으로 건너뛰기</a>
${header(ctx, path)}
${crumbs.length > 1 ? trailHtml(crumbs) : ''}
<main id="main">
<h1 class="head1">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${dockBar(cfg)}
<script src="/assets/vtr.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 기울여 자른 호박색 판이지만 `<a href="tel:">` 이다.
   size: s(머리) · m(본문) · l(대문·아래 줄) */
export function dialBtn(cfg, { size = 'm', bar = false } = {}) {
  return `<a class="dial dial-${size}${bar ? ' dial-b' : ''}" href="tel:${cfg.telRaw}">
  <span class="dial-i" aria-hidden="true"></span>
  <span class="dial-t"><span class="dial-k">${esc(cfg.telLabel)}</span><span class="dial-v">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리 — 어두운 띠 두 줄. 메뉴는 기울여 자른 칩으로 현재 자리를 표시한다. */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '닿는 자리'], ['/course/', '코스'], ['/price/', '요금'], ['/guide/', '처음이라면'], ['/magazine/', '기록']];
  return `<header>
  <div class="cap">
    <div class="cap-in">
      <a class="sign" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">
        ${TILTLOGO()}<span class="sign-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
      </a>
      <div class="cap-r">
        <p class="cap-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
        ${dialBtn(cfg, { size: 's' })}
      </div>
    </div>
  </div>
  <nav class="rail" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}><span>${t}</span></a></li>`).join('')}</ul></nav>
</header>`;
}

function trailHtml(crumbs) {
  return `<nav class="trail" aria-label="여기까지 온 길"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 맡은 이 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="base">
  <div class="base-in">
    <section>
      <p class="b-nm">${esc(cfg.brand.ko)}</p>
      <p class="b-say">들르실 매장이 없습니다. 연락을 주시면 관리사가 가방을 들고 그 주소로 갑니다. 쪽을 가진 층은 시군구 ${counts.gu}곳과 동 ${counts.spot}칸, 들어오는 문은 아래 번호 하나입니다.</p>
      ${dialBtn(cfg, { size: 'm' })}
      <p class="b-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="b-h">동 한 칸까지</p>
      <ul class="tags">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="b-h" style="margin-top:16px">시군구 선까지</p>
      <ul class="tags">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="b-sm"><a href="/area/">닿는 자리를 한 장에 펼치기</a> · 읍·면 ${counts.rural}칸은 이름만 올렸습니다</p>
    </nav>
    <div>
      <p class="b-h">문서</p>
      <ul class="b-ul">
        <li><a href="/guide/">처음이라면</a></li>
        <li><a href="/price/">요금</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="b-h" style="margin-top:18px">최근 기록</p>
      <ul class="b-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="b-h" style="margin-top:18px">긁어 가는 길</p>
      <ul class="tags"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="b-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="base-end"><div>
    ${biz ? `<p class="b-biz">${biz}</p>` : '<p class="b-biz b-pale">사업자 정보는 정해지는 대로 이 줄에 올립니다.</p>'}
    <p class="b-ai">지역 쪽에 적힌 누운 방향과 길쭉함은 공개된 행정동 경계를 기계로 돌려 가며 잰 값이며, 문장은 <strong>AI 도구로 초벌을 쓰고</strong> 사람이 고쳐 올렸습니다. 후기·체험담·별점을 모으지도 싣지도 않고 인물 사진을 쓰지 않습니다. 밑자료: ${esc(data.source)}</p>
    <p class="b-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 병을 고치는 의료 행위가 아니고 성적인 서비스를 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 줄 */
function dockBar(cfg) {
  return `<div class="dock">
  ${dialBtn(cfg, { size: 'l', bar: true })}
  <span class="dock-s">닿기까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/**
 * 칸 틀 — 기울여 자른 머리표가 제목 왼쪽에 붙는다.
 */
export function slab(id, label, h2, inner, sub, n) {
  return `<section class="slab" id="${id}" aria-labelledby="${id}-h">
  <header class="slab-h">
    <span class="slab-no" aria-hidden="true" data-eyebrow="${esc(label)}${n ? ` ${n}` : ''}"></span>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="slab-t">${sub}</p>` : ''}
  </header>
  <div class="slab-b">${inner}</div>
</section>`;
}
