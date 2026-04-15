# 05-middleware/next — middleware.ts

## 구현

```ts
// middleware.ts (프로젝트 루트)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
```

로그인 페이지는 `document.cookie = 'access_token=...; path=/'` 로 쿠키 세팅 (데모 목적).

## 예상 결과

- `curl -I http://localhost:3502/dashboard` → `307 Temporary Redirect`, `Location: /login`
- 브라우저: `/dashboard` 입력 순간 이미 `/login`으로 바뀜. 깜빡임 없음
