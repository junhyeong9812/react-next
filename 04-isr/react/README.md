# 04-isr/react — React는 ISR이 없다

## 목적

SSG로 빌드된 React 앱이 데이터 변경 시 어떻게 뒤쳐지는지 보인다. 해결책은 재빌드뿐.

## 구조

03-ssg/react와 거의 동일(복사). 다만:
- `README.md`에 "데이터 바뀌면 재빌드 필요"를 명시
- `scripts/rebuild.sh` 제공 — 수동 재빌드 트리거

## 예상 결과

```bash
# 초기
curl -s http://localhost:3301/posts/1 | grep title  # "첫 글"

# 백엔드 데이터 변경
curl -X PATCH http://localhost:8080/api/posts/1 -H "Content-Type: application/json" -d '{"title":"수정됨"}'

# 여전히 구 데이터
curl -s http://localhost:3301/posts/1 | grep title  # "첫 글"

# 재빌드 후에야 반영
docker compose build react && docker compose up -d react
curl -s http://localhost:3301/posts/1 | grep title  # "수정됨"
```

## 학습 포인트

- 프리렌더 결과는 파일로 박제됨
- 클라이언트 fetch로 되살리면 SSG 아님
- CI로 주기적 재빌드 → 배포 파이프라인 비용
