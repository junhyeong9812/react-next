# 06-api-route — API Route / BFF

## 증명하려는 것

React SPA는 클라이언트가 직접 백엔드를 호출 → **내부 API 주소/키가 노출**됨.
Next는 Route Handler를 경유 → 클라는 자기 서버만 보고, 내부 API는 서버 간 호출로 은닉됨.

## 서비스

| 서비스 | 포트 |
|---|---|
| backend | 8080 (⚠️ compose 네트워크 내부에서만 접근 가능하게 매핑 안 함) |
| react | 3601 |
| next | 3602 |

**이 phase는 의도적으로 backend 포트를 외부 매핑하지 않음**. React가 `backend` hostname으로는 브라우저에서 접근 불가 → 배포 환경에서 "내부 API 주소가 클라이언트에서 안 보이는" 상황을 시뮬레이션하려면 어떻게든 `localhost`로 노출되거나 CORS 뚫려야 함. 이 불편함 자체가 학습 포인트.

→ 실무적으로는 backend 앞에 별도 public 도메인을 두거나, BFF를 씌움. 이 phase에선 **Next가 BFF 역할**을 하는 걸 보여줌.

## 페이지

- `/posts` 글 목록 — React는 직접, Next는 `/api/posts` Route Handler 경유

## 실행

```bash
cd 06-api-route
docker compose up --build
```

## 예상 결과

### React (3601)

- `/posts` 진입 시 DevTools 네트워크 탭:
  - **request URL: `http://localhost:8080/api/posts`** ← 내부 백엔드 주소가 노출됨
- 번들 검색:
  ```bash
  docker exec react grep -r "localhost:8080" dist
  # 매치됨 → 클라이언트에 백엔드 주소 하드코딩
  ```

### Next (3602)

- `/posts` 진입 시 DevTools 네트워크 탭:
  - **request URL: `/api/posts`** ← 자기 서버 경로만 보임
- `.next/static` 번들 검색:
  ```bash
  docker exec next grep -r "backend:8080" .next/static
  # 매치 없음 → 클라에서 내부 백엔드 주소 보이지 않음
  ```

## 학습 포인트

- BFF = Backend For Frontend
- Next Route Handler (`app/api/*/route.ts`)는 클라 요청을 받아 서버에서 내부 API로 포워딩
- 다중 API 조합 시 이점이 극대화 (여러 API를 서버에서 묶어 한 번에 반환)
