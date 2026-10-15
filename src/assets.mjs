import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **기울어진 사선**이다. 이 사이트가 재는 값(땅이 누운 방향) 그대로
 *   제목표와 버튼, 머리표를 전부 18도 기울여 잘라 쓴다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *     솔레이스바디 비스듬히 잘린 귀퉁이 · 각진 타일 · 상아+청록
 *     레스토라럭스 가는 겹줄 액자 · 어두운 남보라 바탕 · 남보라+황동
 *     리쥬베나     덩어리 없음 · 흰 바탕 · 굵은 풀빛 밑줄
 *   ★여기는 **짙은 청록 바탕**에 호박색 사선이다. 어두운 바탕을 쓴 곳이 둘
 *     있지만(블리스놋 흑연, 레스토라럭스 남보라) 청록 계열은 비어 있었고,
 *     기울여 자른 꼴은 어느 사이트에도 없다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#0E2A2B', deep: '#0A1F20', panel: '#143537',
  ink: '#E6EFEA', dim: '#9FB4AE',
  acc: '#F2A65A', accDk: '#D98635', accSoft: '#2A4A44',
  line: '#27514F', mint: '#7FD1C1',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--deep:${t.deep};--panel:${t.panel};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--mint:${t.mint};
  --w:1000px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
  --tilt:-18deg;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.85;font-size:16.5px;letter-spacing:-.006em;padding-bottom:86px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--acc);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--mint);font-weight:700}
.skipto{position:absolute;left:-9999px}
.skipto:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#102A2B;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.cap{background:var(--deep);border-bottom:1px solid var(--line)}
.cap-in{max-width:var(--w);margin:0 auto;padding:18px 20px 14px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.sign{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.sign:hover{text-decoration:none}
.tmk{width:32px;height:32px;flex:none}
.sign-t b{display:block;font-size:19.5px;font-weight:800;letter-spacing:-.035em;line-height:1.1}
.sign-t i{display:block;font-style:normal;font-family:var(--mono);font-size:9.5px;letter-spacing:.24em;color:var(--mint)}
.cap-r{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.cap-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.cap-run span{display:block}
.rail{background:var(--deep);border-bottom:1px solid var(--line)}
.rail ul{max-width:var(--w);margin:0 auto;padding:0 20px;list-style:none;display:flex;gap:4px;overflow-x:auto}
.rail a{display:block;padding:9px 14px;font-size:13.5px;font-weight:700;color:var(--dim);white-space:nowrap;
  transform:skewX(var(--tilt))}
.rail a span{display:block;transform:skewX(calc(-1 * var(--tilt)))}
.rail a:hover{color:var(--ink);text-decoration:none;background:var(--panel)}
.rail a[aria-current]{background:var(--acc);color:#102A2B}

/* ── 지나온 길 ─────────────────────────────────────── */
.trail{max-width:var(--w);margin:0 auto;padding:13px 20px 0}
.trail ol{list-style:none;display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.trail li+li::before{content:"\\\\";margin-right:7px;color:var(--line)}
.trail a{color:var(--dim)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:22px 20px 64px}
.head1{font-size:27px;font-weight:800;letter-spacing:-.042em;line-height:1.25;margin:16px 0 0}
@media (min-width:720px){.head1{font-size:37px}}
.head1-s{display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.008em}
.head1::after{content:"";display:block;width:96px;height:7px;background:var(--acc);margin:18px 0 24px;transform:skewX(var(--tilt))}
.lede{margin:0 0 34px;max-width:51rem;font-size:17px;color:var(--ink)}
.lede p{margin:0 0 .95em}
.lede p:last-child{margin-bottom:0}

/* ── 칸 = 기울여 자른 머리표 ──────────────────────── */
.slab{margin:0 0 36px}
.slab+.slab{border-top:1px solid var(--line);padding-top:30px}
.slab-h{margin:0 0 18px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.slab-no{display:inline-block;padding:3px 11px;background:var(--panel);color:var(--mint);
  font-family:var(--mono);font-size:10px;letter-spacing:.2em;transform:skewX(var(--tilt));white-space:nowrap}
.slab-no::before{content:attr(data-eyebrow);display:block;transform:skewX(calc(-1 * var(--tilt)))}
.slab h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.033em;line-height:1.35;flex:1 1 16em}
@media (min-width:720px){.slab h2{font-size:23.5px}}
.slab-t{margin:0;flex:1 1 100%;font-size:14px;color:var(--dim)}
.slab-x{margin:18px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 장부 ──────────────────────────────────────────── */
.ledger{width:100%;border-collapse:collapse;font-size:15px}
.ledger th,.ledger td{padding:11px 2px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.ledger th{width:44%;font-weight:700;color:var(--mint);font-size:12.5px}
@media (min-width:600px){.ledger th{width:28%}}

/* ── 코스 = 정의형 목록 ────────────────────────────── */
.menu8{margin:0}
.menu8 dt{display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap;
  padding:14px 0 4px;border-top:1px solid var(--line)}
.menu8 dt:first-child{border-top:0}
.menu8 dt a{font-size:17.5px;font-weight:800;letter-spacing:-.028em;color:var(--ink)}
.menu8 dt a:hover{color:var(--acc);text-decoration:none}
.menu8 .fee{font-family:var(--mono);font-size:15.5px;color:var(--acc);font-weight:700;white-space:nowrap}
.menu8 dd{margin:0 0 14px;font-size:13px;color:var(--dim)}
.menu8 dd.spec{font-family:var(--mono);font-size:11.5px;color:var(--mint);margin-bottom:4px;letter-spacing:.01em}

/* ── 접수 = 가로 트랙 ──────────────────────────────── */
.track{list-style:none;margin:0;padding:0;display:grid;gap:0;counter-reset:tk}
@media (min-width:760px){.track{grid-template-columns:repeat(5,1fr);gap:14px}}
.track li{padding:14px 0 14px 0;border-top:3px solid var(--line);position:relative}
@media (max-width:759px){.track li{padding-left:40px;border-top:1px solid var(--line)}}
.track li::before{content:"0" counter(tk);counter-increment:tk;display:block;
  font-family:var(--mono);font-size:11px;color:var(--acc);letter-spacing:.14em;margin-bottom:6px}
@media (max-width:759px){.track li::before{position:absolute;left:0;top:15px;margin:0}}
.track li:first-child{border-top-color:var(--acc)}
.track h3{margin:0 0 5px;font-size:15px;font-weight:800}
.track p{margin:0;font-size:13.5px;color:var(--dim)}

/* ── 묻고 답하기 = 두 칸 ───────────────────────────── */
.qna{display:grid;gap:0}
@media (min-width:780px){.qna{grid-template-columns:1fr 1fr;gap:0 34px}}
.qna>div{padding:16px 0;border-bottom:1px solid var(--line)}
.qna .tag{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--mint);margin-bottom:5px}
.qna h3{margin:0 0 7px;font-size:16px;font-weight:800;letter-spacing:-.025em}
.qna p{margin:0;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.mind{list-style:none;margin:0;padding:0}
.mind li{padding:12px 0 12px 30px;font-size:14.5px;color:var(--dim);border-bottom:1px solid var(--line);position:relative}
.mind li:last-child{border-bottom:0}
.mind li::before{content:"";position:absolute;left:0;top:21px;width:14px;height:4px;background:var(--acc);transform:skewX(var(--tilt))}

/* ── 목록·링크 ─────────────────────────────────────── */
.tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.tags a{display:inline-block;font-size:13.5px;color:var(--ink);background:var(--panel);padding:5px 12px}
.tags a:hover{background:var(--acc);color:#102A2B;text-decoration:none}
.plots{list-style:none;margin:0;padding:0;display:grid;gap:0}
@media (min-width:560px){.plots{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.plots{grid-template-columns:1fr 1fr 1fr}}
.plots li{border-bottom:1px solid var(--line)}
.plots a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;padding:10px 10px 10px 0;color:var(--ink)}
.plots a:hover{text-decoration:none;color:var(--acc)}
.plots .on a,.plots a[aria-current]{background:var(--panel);padding-left:10px;font-weight:700}
.p-n{font-weight:600;font-size:14.5px}
.p-s{font-family:var(--mono);font-size:10.5px;color:var(--dim);white-space:nowrap}
.names{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 15px}
.names li{font-size:13.5px;color:var(--dim)}

/* ── 견주기 ────────────────────────────────────────── */
.cmp{width:100%;border-collapse:collapse;font-size:14.5px}
.cmp th,.cmp td{padding:11px 8px 11px 0;text-align:left;border-bottom:1px solid var(--line)}
.cmp thead th{font-size:12px;color:var(--mint);font-weight:700;border-bottom:2px solid var(--acc)}
.cmp tbody th{font-weight:700}
.cmp tbody tr.now th,.cmp tbody tr.now td{background:var(--panel)}

/* ── 예약 문의 ─────────────────────────────────────── */
.dial{display:inline-flex;align-items:center;gap:12px;background:var(--acc);color:#102A2B;
  padding:11px 24px;text-decoration:none;transform:skewX(var(--tilt))}
.dial>*{transform:skewX(calc(-1 * var(--tilt)))}
.dial:hover{background:#FFBE77;text-decoration:none}
.dial-i{flex:none;display:block;width:13px;height:13px;border:3px solid #102A2B}
.dial-t{display:flex;flex-direction:column;line-height:1.22;min-width:0}
.dial-k{font-size:9.5px;letter-spacing:.24em;font-family:var(--mono);opacity:.85}
.dial-v{font-family:var(--mono);font-weight:700;white-space:nowrap}
.dial-s .dial-v{font-size:15px}
.dial-m .dial-v{font-size:18px}
.dial-l .dial-v{font-size:21px}
.dial-l{padding:13px 28px}
.dial-b{display:flex;width:100%;justify-content:center;transform:none}
.dial-b>*{transform:none}
.ping{background:var(--panel);padding:24px 22px;margin:0 0 36px;border-left:7px solid var(--acc)}
.ping-p{margin:0 0 16px;font-size:16px;max-width:47rem}
.ping-s{margin:14px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.hero{padding:10px 0 34px;border-bottom:1px solid var(--line);margin:0 0 36px}
.hero-sl{margin:0 0 16px;font-size:24px;font-weight:800;letter-spacing:-.042em;max-width:20em;line-height:1.35}
@media (min-width:720px){.hero-sl{font-size:32px}}
.hero-p{margin:0 0 24px;color:var(--dim);font-size:16px;max-width:45rem}
.hero-f{display:grid;gap:0;margin:26px 0 0}
@media (min-width:640px){.hero-f{grid-template-columns:repeat(4,1fr);gap:0 14px}}
.hero-f div{padding:13px 0;border-top:3px solid var(--line)}
.hero-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--acc)}
.hero-f dd{margin:4px 0 0;font-size:12.5px;color:var(--dim)}

/* ── 지역 고르기 = 여덟 갈래 줄무늬 ────────────────
   ★이름을 두 칸으로 늘어놓지 않는다. 시도마다 그 안 동들이 어느 쪽으로
     누웠는지를 여덟 칸짜리 막대로 깔고, 이름은 그 위에 얹는다. */
.rose{list-style:none;margin:0;padding:0}
.rose li{border-top:1px solid var(--line)}
.rose li:last-child{border-bottom:1px solid var(--line)}
.rose a{display:block;padding:12px 0 14px;color:var(--ink)}
.rose a:hover{text-decoration:none}
.rose-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.rose b{font-size:17px;font-weight:800;letter-spacing:-.03em}
.rose a:hover b{color:var(--acc)}
.rose .meta{font-family:var(--mono);font-size:10.5px;color:var(--dim);white-space:nowrap}
.rose .bars{display:grid;grid-template-columns:repeat(8,1fr);gap:3px;align-items:end;height:30px}
.rose .bars i{display:block;background:var(--accSoft);min-height:3px}
.rose a:hover .bars i{background:var(--line)}
.rose .bars i.top{background:var(--acc)}
.rose li.sub .bars i{background:#1C3E3C}
.rose li.sub .bars i.top{background:var(--mint)}
.rose li.sub b{font-weight:600;color:var(--dim)}
.rose-key{margin:18px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:14px}
.rose-ax{display:grid;grid-template-columns:repeat(8,1fr);gap:3px;margin-top:10px;font-family:var(--mono);font-size:9px;color:var(--dim);text-align:center}

/* ── 주제 묶음 링크 ────────────────────────────────── */
.ways{display:grid;gap:24px}
@media (min-width:720px){.ways{grid-template-columns:1fr 1fr}}
.way-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--mint)}

/* ── 글 ────────────────────────────────────────────── */
.read{max-width:45rem;font-size:17px}
.read h2{margin:34px 0 14px;font-size:19px;font-weight:800;padding-left:13px;border-left:6px solid var(--acc)}
.read p{margin:0 0 1.05em}
.read ul{margin:0 0 1.05em;padding-left:1.1em;color:var(--dim)}
.notes{list-style:none;margin:0;padding:0;display:grid;gap:0}
@media (min-width:680px){.notes{grid-template-columns:1fr 1fr;gap:0 30px}}
.notes li{border-bottom:1px solid var(--line)}
.notes a{display:block;padding:16px 0;color:var(--ink)}
.notes a:hover{text-decoration:none}
.notes b{display:block;font-size:16.5px;font-weight:800;margin-bottom:6px}
.notes a:hover b{color:var(--acc)}
.notes p{margin:0;font-size:13.5px;color:var(--dim)}
.notes time{display:block;margin-top:8px;font-family:var(--mono);font-size:10.5px;color:var(--mint)}
.clause h2{margin:26px 0 9px;font-size:16.5px;font-weight:800;padding-left:12px;border-left:5px solid var(--accSoft)}
.clause p,.clause li{font-size:15px;color:var(--dim)}
.stamp{margin:0 0 18px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.base{background:var(--deep);border-top:1px solid var(--line);margin-top:28px}
.base-in{max-width:var(--w);margin:0 auto;padding:32px 20px 24px;display:grid;gap:28px}
@media (min-width:860px){.base-in{grid-template-columns:1.3fr 1fr 1fr}}
.b-h{margin:0 0 11px;font-family:var(--mono);font-size:10px;letter-spacing:.22em;color:var(--mint)}
.b-nm{margin:0 0 9px;font-size:19px;font-weight:800;letter-spacing:-.025em}
.b-say{margin:0 0 15px;font-size:14px;color:var(--dim)}
.b-run{margin:13px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.b-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:14px}
.b-ul a{color:var(--ink)}
.b-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.b-sm{margin:11px 0 0;font-size:12px;color:var(--dim)}
.base-end div{max-width:var(--w);margin:0 auto;padding:0 20px 26px;border-top:1px solid var(--line);padding-top:19px}
.b-biz{margin:0 0 9px;font-size:12px;color:var(--dim)}
.b-pale{opacity:.68}
.b-ai{margin:0 0 9px;font-size:12px;color:var(--dim);line-height:1.72}
.b-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.dock{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--deep);border-top:3px solid var(--acc);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;transition:transform .2s}
.dock.away{transform:translateY(130%)}
.dock-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.dock{display:none}}
@media print{.dock,.rail,.ping{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.dock'),ft=document.querySelector('.base');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('away',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 기울여 겹친 세 조각 — 이 사이트가 재는 '누운 방향' 그대로 */
const TILTMARK = (a, b) => `<g fill="${a}"><path d="M11 4h7l-7 24h-7z"/></g><g fill="${b}"><path d="M21 4h7l-7 24h-7z" opacity=".75"/></g>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${t.deep}"/>${TILTMARK(t.acc, t.mint)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 48"><rect width="260" height="48" fill="${t.deep}"/><g transform="translate(8,8) scale(.85)">${TILTMARK(t.acc, t.mint)}</g><text x="46" y="26" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="${t.ink}">바이탈리티럽</text><text x="46" y="38" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.mint}">VITALITYRUB</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<g fill="${t.panel}"><path d="M860 0h120L760 630H640z"/><path d="M1010 0h120L910 630H790z"/></g>
<g transform="translate(92,74) scale(3)">${TILTMARK(t.acc, t.mint)}</g>
<text x="92" y="320" font-family="system-ui,sans-serif" font-size="50" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="92" y="382" font-family="system-ui,sans-serif" font-size="26" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="92" y="430" font-family="ui-monospace,monospace" font-size="20" fill="${t.mint}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<g transform="skewX(-18) translate(130,0)"><rect x="92" y="466" width="400" height="70" fill="${t.acc}"/></g>
<text x="128" y="494" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="#102A2B">${cfg.telLabel}</text>
<text x="128" y="524" font-family="ui-monospace,monospace" font-size="26" font-weight="700" fill="#102A2B">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'vtr.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'vtr.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const TILTLOGO = (t = THEME) => `<svg class="tmk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${TILTMARK(t.acc, t.mint)}</svg>`;
