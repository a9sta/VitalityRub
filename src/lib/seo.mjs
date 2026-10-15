/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 열두 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *     어반오아시스 `{동} 출장마사지 홈타이 / {구} {코스어} {행동어} · 어반오아시스`
 *     솔레이스바디 `{동} 출장마사지 홈타이 : {구} {코스어} {행동어} | 솔레이스바디`
 *     레스토라럭스 `{동} 출장마사지 | {구} 홈타이 {코스어} {행동어} · 레스토라럭스`
 *     리쥬베나     `{동} 출장마사지 홈타이 · {코스어} · {구} {행동어} 리쥬베나`
 *   ★**줄표를 두 번 써서 세 토막으로 가르고 코스어를 맨 앞 동 이름 뒤에 붙이는**
 *     모양은 여기서 처음 쓴다. 줄표를 한 번 쓴 곳은 있어도 두 번 쓴 곳은 없다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다. 가운데 토막은 그 자리에서만 나오는 계산값
 *   (누운 쪽, 길쭉함, 긴 변, 채운 몫, 결 짝)으로 채워 전부 달라지게 한다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '바이탈리티럽';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 여덟 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '딥티슈', '스포츠', '타이', '지압', '림프', '건식', '핫스톤'];
/** 제목 꼬리 행동어 */
const ACT = ['문 앞 도착', '시각 맞춤', '새벽 접수', '지금 출발', '값 그대로'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} — 서울 인천 경기 부산 동 방문 — 24시 후불 오늘 출발`,
  areaHub: (c) => `${KEY} 닿는 자리 — 동 ${c.spot}칸 시군구 ${c.gu}곳 전체 — ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} — ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} 방문 — ${at(hash(sd.name, 'sdt'), ACT)} ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}칸` : g.main ? `읍면 ${g.ruralCount}칸` : `행정동 ${g.dongCount}칸`;
    return `${g.name} ${KEY} — ${sd.name} ${unit} — ${at(h, ACT, 0)} ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${at(h, COURSE_WORD, 0)} ${KEY} — ${g.name} ${at(h, ACT, 1)} — ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} — ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 — 세기 ${c.pressure} ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} — ${sd.name} 방문 — ${at(hash(sd.name, c.slug), ACT)} ${BRAND}`,
  page: (t) => `${t} — ${BRAND} ${KEY}`,
  post: (p) => `${p.title} — ${BRAND} 누운 방향 기록`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 누운 방향에서 나온 값으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `땅이 ${s.axis} 쪽으로 누웠고 긴 변이 ${s.long}m입니다`,
    () => `길쭉함 ${s.ratio}에 감싼 네모를 ${s.fill}% 채웁니다`,
    () => (s.twin ? `${g.name} 안에서 ${s.twin.name}${josa(s.twin.name, '과/와')} 결이 ${s.twin.diff}도 차이로 가깝습니다` : `${g.name}에서 견줄 칸이 따로 없는 한 칸짜리 자리입니다`),
    () => `긴 변 ${s.long}m, 짧은 변 ${s.short}m로 ${s.axis} 쪽입니다`,
    () => `길쭉함으로 ${g.name}에서 ${s.guRatioRank}번째입니다`,
    () => `땅 ${km2(s.area)}에 ${s.axis} 결, 길쭉함 ${s.ratio}입니다`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '값은 마치고 치릅니다',
  '선입금을 받지 않습니다',
  '거리로 값표를 고치지 않습니다',
  '깊은 밤에도 같은 값입니다',
  '셈은 끝나고 한 번만 합니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 땅이 어느 쪽으로 누웠는지를 칸마다 재 두었습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이로 나가는 동 ${c.spot}칸과 시군구 ${c.gu}곳. 칸마다 누운 쪽과 길쭉함을 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}칸에 쪽이 있고 길쭉함 평균이 ${sd.avgRatio}입니다.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}칸에 쪽이 있고 구 전체가 ${g.guAxis} 쪽으로 누웠습니다`,
        `가장 길쭉한 칸은 ${g.longSpot}(${g.longRatio})이고 가장 네모난 칸은 ${g.boxSpot}입니다`,
        `긴 변 ${g.guLong}m, 짧은 변 ${g.guShort}m로 길쭉함 ${g.guRatio}입니다`,
        `긴 변이 가장 긴 칸은 ${g.widestSpot}${josa(g.widestSpot, '으로/로')} ${g.widestLong}m입니다`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}칸이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}칸과 면 ${g.myeonCount}칸을 이름으로 올렸습니다`,
          `땅 ${km2(g.area)}가 ${g.guAxis} 쪽으로 누웠습니다`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}칸이 들어 있고 결은 ${g.guAxis}입니다`,
          `길쭉함 ${g.guRatio}인 ${km2(g.area)}짜리 땅입니다`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}칸 모두 나갑니다` : `동 ${g.dongNames.length}칸 어디나 한 번호로`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.focus}${josa(c.focus, '을/를')} 오래 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
