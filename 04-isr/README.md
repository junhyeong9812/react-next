# 04-isr — Incremental Static Regeneration

## 증명하려는 것

SSG의 한계: 데이터가 바뀌면 재빌드 필요. Next의 ISR은 `revalidate` 한 줄로 "일정 시간 후 백그라운드 재생성"을 제공.

**React로는 동일 동작 불가능** — 이 phase의 핵심은 "왜 불가능한가"를 코드와 문서로 보이는 것.

## 서비스

| 서비스 | 포트 | 설명 |
|---|---|---|
| backend | 8080 | `PATCH /api/posts/{id}`로 `updatedAt`/body 변경 가능 (ISR 전용 추가 엔드포인트) |
| react | 3301 | SSG 빌드 + "다시 보려면 재빌드해야 함" 문서화 |
| next | 3302 | `revalidate: 10` |

## 실험 흐름

1. `docker compose up --build` → 양쪽 빌드
2. 브라우저에서 `/posts/1` 양쪽 확인 → 동일 제목
3. `curl -X PATCH http://localhost:8080/api/posts/1 -d '{"title":"수정됨"}'`
4. 10초 이내: 양쪽 새로고침 → 여전히 구 데이터
5. 10초 이후 Next 새로고침 → **"수정됨"으로 변경됨** ✅
6. 같은 시점 React 새로고침 → **여전히 구 데이터** ❌
7. React 컨테이너 재빌드 → 그제서야 변경 반영

## 예상 결과

```bash
# Step 5 직후
curl -s http://localhost:3302/posts/1 | grep "수정됨"  # ✅
curl -s http://localhost:3301/posts/1 | grep "수정됨"  # ❌ (빌드 시점에 박힌 값)
```

## 학습 포인트

- Next의 `revalidate: N`은 "첫 요청이 N초 후 들어오면 백그라운드에서 재생성, 그 다음 요청부터 새 HTML"
- React에서 유사하게 하려면 CI/CD로 주기적 재빌드를 걸거나, SSR로 회귀하거나, 클라이언트 fetch로 변환해야 함 → 더이상 SSG가 아님
- ISR은 **SSG의 지속성 + SSR의 신선함**을 절충
