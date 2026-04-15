# 09-image-font — 이미지/폰트 최적화

## 증명하려는 것

큰 이미지 3장 + 커스텀 웹폰트 사용 시:
- React: `<img>` 그대로, `<link>` 수동 → CLS(Cumulative Layout Shift) 발생, LCP 느림
- Next: `next/image`, `next/font` → 자동 레이지 로드, 포맷 변환, 폰트 preload + CLS 방지

## 서비스

| 서비스 | 포트 |
|---|---|
| react | 3901 |
| next | 3902 |

(백엔드 불필요 — 정적 에셋만 사용)

## 페이지

- `/gallery` — 이미지 3장 + 커스텀 폰트로 제목

## 실험

1. Chrome DevTools → Lighthouse → Mobile 모드로 측정
2. CLS, LCP, Total Blocking Time 비교
3. 네트워크 탭에서 이미지 요청 포맷 확인 (`.jpg` vs `.webp`/`.avif`)

## 예상 결과

| 지표 | react | next |
|---|---|---|
| CLS | 높음 (이미지 로드되며 레이아웃 밀림) | 낮음 (width/height 미리 예약) |
| LCP | 큰 원본 이미지 전체 로드 대기 | `srcset`으로 적절 크기 선택, WebP |
| 폰트 FOIT/FOUT | 발생 가능 | `next/font`가 swap/preload 자동 |
| 이미지 포맷 | 원본 jpg 그대로 | `/next/image?url=...&w=...&q=...` (webp/avif) |
| 레이지 로드 | 없음 | 기본 `loading="lazy"` |

## 학습 포인트

- `next/image`는 빌드 타임 최적화 + 런타임 이미지 서버 기능 내장
- `next/font`는 빌드 타임에 폰트 다운로드 → self-host → FOIT 방지
- React에서 동일 효과를 내려면 sharp 기반 빌드 스크립트 + font-display swap 설정 수동
