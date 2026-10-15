# 문구를 고칠 때

- 화면에 나가는 문장은 전부 `src/content/copy.mjs` 와 각 `src/pages/*.mjs` 에 있다.
- **다른 사이트와 한 문장도 겹치면 안 된다.** 고친 뒤에는 반드시:

```bash
cd /data/wwwroot
python3 /root/msg-daily/xdup-source.py vitalityrub <상대사이트들…>   # 문장 완전일치 + 소스 역추적
python3 /root/msg-daily/netlify-skelcheck.py vitalityrub/dist <상대>/dist  # 단어만 바꾼 중복
```

- 허용되는 예외는 전화 버튼 줄(`예약 문의 050-…`) 하나뿐이다.
- 지명·코스 이름 뒤에 조사를 붙일 때는 반드시 `josa()` 를 쓴다. 맨 '은/는/이/가/로' 금지.
- 숫자가 **0이 될 수 있는 자리**는 전부 0 분기를 둔다(동이 0인 군, 한 칸뿐인 구 등).
- 마크다운 별표는 화면에 그대로 찍힌다. 굵게는 `<strong>` 으로.
