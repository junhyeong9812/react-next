# 12-env-vars — 환경변수 노출

## 증명하려는 것

- React(Vite): `VITE_*` prefix 변수만 빌드 번들에 박힘. **서버가 없어 "서버 전용 변수"라는 개념 자체가 없음**.
- Next: `NEXT_PUBLIC_*` prefix만 클라 번들에. 그 외 변수는 **서버에서만** 접근 가능.

## 서비스

| 서비스 | 포트 |
|---|---|
| react | 3121 |
| next | 3122 |

(백엔드 불필요)

## 주입할 환경변수

- `PUBLIC_KEY=this-is-public` (클라에 노출되어도 OK)
- `SECRET_KEY=this-is-secret` (절대 노출되면 안 됨)

## 페이지

- `/env` — 환경변수 값을 화면에 표시하려 시도

## 실행

```bash
cd 12-env-vars
docker compose up --build
```

## 예상 결과

### React (Vite)

- `VITE_PUBLIC_KEY=this-is-public` → `import.meta.env.VITE_PUBLIC_KEY`로 접근, **번들에 박힘**
- `SECRET_KEY` → 접근 방법 없음. 억지로 쓰면 undefined
- "서버에서만 쓰고 클라에 안 내보내기"는 React SPA로는 불가능 (서버가 없으니까)

```bash
docker exec react grep -r "this-is-public" dist/assets/
# 매치됨

docker exec react grep -r "this-is-secret" dist/assets/
# 매치 없음 (애초에 변수가 주입 안 됨)
```

### Next

- `NEXT_PUBLIC_KEY=this-is-public` → 클라/서버 모두 접근
- `SECRET_KEY=this-is-secret` → 서버 컴포넌트/Route Handler에서만 접근

```bash
docker exec next grep -r "this-is-public" .next/static
# 매치됨

docker exec next grep -r "this-is-secret" .next/static
# 매치 없음

docker exec next grep -r "this-is-secret" .next/server
# 매치됨 (서버 번들)
```

### 실수로 노출하는 시나리오

React에서 API Key를 `VITE_API_KEY`로 넣으면 → 빌드된 JS에 그대로 박힘 → 누구나 DevTools에서 볼 수 있음.
Next에서 `NEXT_PUBLIC_API_KEY`로 넣으면 동일하게 노출. `API_KEY`로만 넣으면 서버에서만 사용되어 안전.

## 학습 포인트

- "Public 환경변수 prefix 관례"의 본질: **빌드 타임 번들 박제 vs 런타임 서버 주입**의 경계 표시
- React에는 후자가 없음 → 실수로 키를 넣으면 그대로 노출
- Next의 서버 레이어가 이 경계를 프레임워크 수준에서 강제
