# 빅데이터 MD 유형 테스트

서울시립대학교 빅데이터혁신융합대학사업단 설명회용 모바일 웹 테스트. 기획은 `PLAN.md`, 구현 규칙은 `AGENTS.md`를 본다.

## 명령어

```sh
pnpm install
pnpm dev          # 개발 서버
pnpm test         # 로직 골든 테스트 (tests/logic)
pnpm run typecheck
pnpm run lint
pnpm build
```

## 학기가 바뀌면

`src/data/term.json`의 `termLabel`과 `openThisTerm`만 교체한다. 다른 데이터 파일을 바꿨다면 PR 설명에 이유를 적는다.

## 구조

- `src/data/` 과목·슬롯·연계융합·문항·유형 데이터 (JSON) 와 타입
- `src/logic/` 판정 로직 (순수 함수)
- `src/state/` reducer
- `src/screens/` S0–S6 화면 (S7 마무리는 S6 하단)
- `public/mascot.webp`, `public/types/*.webp` 캐릭터·결과 이미지 (`reference/images` 원본을 640px webp로 변환)
