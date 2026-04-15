# Backend — 공통 Kotlin Spring Boot 서버

전 phase가 공유하는 단일 백엔드. 프레임워크 차이 비교에서 **백엔드 변수**를 제거하기 위함.

## 스택

- Kotlin 1.9+
- Spring Boot 3.x
- Gradle (Kotlin DSL)
- 베이스 이미지: `eclipse-temurin:21-jre-alpine` (멀티스테이지 빌드)

## 엔드포인트

| 메서드 | 경로 | 설명 | 특이사항 |
|---|---|---|---|
| GET | `/api/posts` | 글 목록 | 300ms 인위 지연 |
| GET | `/api/posts/{id}` | 글 상세 | `updatedAt` 포함 |
| GET | `/api/weather?city=seoul` | 날씨 | `X-API-Key` 헤더 필수, 없으면 401 |

## 데이터

`src/main/resources/data/posts.json`
```json
[
  { "id": 1, "title": "첫 글", "body": "...", "author": "kim", "updatedAt": "2026-04-16T10:00:00Z" },
  { "id": 2, "title": "두번째 글", "body": "...", "author": "park", "updatedAt": "..." },
  ...최소 5건
]
```

`src/main/resources/data/weather.json`
```json
{
  "seoul": { "temp": 18, "condition": "맑음" },
  "tokyo": { "temp": 22, "condition": "흐림" },
  "newyork": { "temp": 12, "condition": "비" }
}
```

## 환경변수

- `API_KEY=demo-secret-key` — `/api/weather` 검증용

## CORS

React SPA(클라이언트 직접 호출) 허용 필요:
- `localhost:3001`~`3010` 범위 허용

## 포트

- 컨테이너: `8080`
- 호스트 매핑: `8080:8080`

## 실행 (단독)

```bash
docker build -t react-next-backend .
docker run -p 8080:8080 -e API_KEY=demo-secret-key react-next-backend
```

## 예상 응답

```bash
curl http://localhost:8080/api/posts
# [{ "id": 1, ... }, ...]  (300ms 지연 후)

curl http://localhost:8080/api/weather?city=seoul
# 401 Unauthorized

curl -H "X-API-Key: demo-secret-key" http://localhost:8080/api/weather?city=seoul
# { "temp": 18, "condition": "맑음" }
```

## 구현 시 주의

- `delay 300ms`는 `/api/posts` 목록에만 적용 (SSR vs CSR 체감용)
- `updatedAt`은 애플리케이션 기동 시점으로 초기화해도 되고, 파일 값 그대로 써도 됨. ISR phase에서 수동으로 바꿀 수 있게 **PATCH endpoint 추가 가능** (선택)
- API Key 검증 실패 시 401 JSON `{ "error": "Unauthorized" }`
