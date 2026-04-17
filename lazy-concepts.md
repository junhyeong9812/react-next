# 지연 평가(Lazy Evaluation) & 레이지 로드(Lazy Load) 개념 정리

> 이름이 비슷해서 자주 섞어 쓰지만, **다루는 계층이 완전히 다른 두 개념**이다.
> 한 줄 요약: **"언제 실행하느냐(지연 평가)" vs "언제 다운로드하느냐(레이지 로드)"**.

---

## 1. 지연 평가 (Lazy Evaluation)

### 1.1 정의

표현식(expression)의 **평가(실행) 시점을 필요한 순간까지 미루는** 전략.
코드는 이미 메모리에 로드되어 있고, "실행만" 늦추는 것.

### 1.2 왜 필요한가

자바스크립트는 기본적으로 **엄격한 평가(strict evaluation / eager evaluation)** 를 한다. 즉 식을 만나면 그 자리에서 즉시 계산한다.

```js
const x = expensiveCalc();  // 이 줄에서 즉시 실행. x가 실제로 쓰이지 않아도 계산함.
```

그래서 다음과 같은 상황에선 낭비가 생긴다:

- 여러 후보 값 중 **실제로 쓰일 값은 하나**인데 전부 계산됨
- 함수 인자로 넘기기만 하고 **호출되지 않을 수도 있는** 값을 미리 계산
- 분기문처럼 **선택적으로** 실행되어야 할 코드가 선제적으로 실행됨

지연 평가는 "필요할 때만 실행"하게 만들어 이 낭비를 제거한다.

### 1.3 JS에서 지연 평가가 자연스럽게 일어나는 경우

JS 자체는 완전한 지연 평가 언어가 아니지만, **일부 연산자/구문은 지연 평가 성질**을 가진다.

| 구문 | 지연 평가 동작 |
|------|---------------|
| `a && b` | `a`가 falsy면 `b`는 **평가하지 않음**(단락 평가) |
| `a \|\| b` | `a`가 truthy면 `b`는 평가하지 않음 |
| `a ?? b` | `a`가 null/undefined가 아니면 `b` 평가하지 않음 |
| `cond ? x : y` | 선택된 쪽만 평가 |
| `if / else` | 선택된 블록만 실행 |
| `switch / case` | 매칭된 case만 실행 |
| 함수 본문 | 호출되기 전까지 실행되지 않음 |
| Generator (`function*`) | `next()` 호출할 때마다 한 단계씩 평가 |
| Promise / async | `await` 지점 전까지 대기, 필요한 순간에만 재개 |

### 1.4 JS에서 **엄격 평가**가 일어나는 경우 (지연 평가가 깨지는 지점)

| 경우 | 모든 value가 즉시 평가됨 |
|------|-------------------------|
| 객체 리터럴 `{ a: f(), b: g() }` | `f()`, `g()` 전부 실행 |
| 배열 리터럴 `[f(), g()]` | 마찬가지 |
| 함수 인자 `foo(f(), g())` | 호출 전에 `f()`, `g()` 모두 평가(→ foo에 결과만 전달) |
| 템플릿 리터럴 `` `${f()}-${g()}` `` | 전부 평가 |
| 구조 분해 `const { a: x = f() } = obj` | 기본값은 필요할 때만 평가되지만, 값이 있으면 기본값 평가는 생략 |

이번 `find-pw.js`의 `components = { [A]: <X/>, [B]: <Y/>, ... }` 는 객체 리터럴이므로 **모든 value(JSX/내부 함수 호출)가 즉시 평가**된다. `components[stepName]`로 하나만 뽑아도 이미 전부 만들어진 뒤다.

### 1.5 지연 평가를 강제하는 기법

#### (a) 썽크(Thunk) — "값 대신 값을 만들어 주는 함수를 넘긴다"

```js
// 엄격 평가
const value = expensiveCalc();

// 지연 평가
const thunk = () => expensiveCalc();  // 호출 전엔 실행 안 됨
// ... 필요할 때:
const value = thunk();
```

- 가장 흔하고 범용적인 기법
- 객체/배열/함수 인자 등 "즉시 평가" 자리에 값 대신 "값을 만드는 함수"를 넣어 평가를 미룸

#### (b) Getter 프로퍼티 — "접근 시점까지 평가 미루기"

```js
const obj = {
  get heavy() {
    return expensiveCalc();
  },
};
obj.heavy;  // 이때 실행됨. 접근 안 하면 실행 안 됨.
```

- 문법적으로 "속성처럼" 보이면서 내부는 함수 호출
- 단점: 접근할 때마다 재실행 (메모이제이션 별도 필요)

#### (c) Generator — "한 스텝씩 평가"

```js
function* naturals() {
  let n = 1;
  while (true) yield n++;  // yield 시점까지만 평가
}
const gen = naturals();
gen.next().value;  // 1
gen.next().value;  // 2
```

- 무한 수열, 스트림, 페이지네이션 같은 상황에 유용
- "필요한 만큼만" 계산하는 전형적 지연 평가

#### (d) Promise / async — "비동기 시점까지 지연"

```js
const pending = fetch('/api/foo');   // 네트워크 요청은 시작되지만
// ...
const data = await pending;           // 실제 값이 필요한 순간까지 다음 코드는 진행
```

- 지연 평가라기보단 "비동기 평가"에 가깝지만, **값의 완성 시점을 늦춘다**는 점에서 같은 가족

#### (e) React 훅들

| 훅 | 지연 평가 관련 역할 |
|----|---------------------|
| `useState(() => heavyInit())` | 초기값을 **함수로 넘기면 최초 1회만** 실행. 리렌더마다 재실행되지 않음 |
| `useMemo(() => calc(), deps)` | deps가 바뀔 때만 `calc()` 실행 |
| `useCallback(fn, deps)` | 함수 참조를 deps가 바뀔 때만 새로 생성 |
| `React.memo(Comp)` | props 얕은 비교로 렌더 건너뜀 (= 하위 트리 평가 지연) |

### 1.6 지연 평가의 이점

1. **성능** — 쓰지 않을 계산을 건너뜀 (무거운 식일 때 유의미)
2. **정확성** — 부수효과(로깅, 이벤트 발생, 예외 throw)가 엉뚱한 분기에서 발동하지 않음
3. **메모리** — 필요한 시점까지 결과를 보유하지 않아 피크 메모리 감소
4. **무한/거대 자료구조 표현 가능** — 제너레이터로 무한 수열을 표현
5. **디버깅 편의** — 실제 활성 경로에서만 브레이크포인트가 걸림

### 1.7 지연 평가의 비용

- **간접 호출 오버헤드** — 함수 래퍼 1겹이 추가됨(대부분 무시 가능)
- **클로저 메모리** — 썽크가 외부 변수를 캡처하면 그만큼 참조 유지
- **가독성** — `() => …` 괄호가 늘어 한눈에 값인지 함수인지 구분이 필요
- **디버깅 스택** — 호출 스택이 한 단 깊어짐

### 1.8 언제 쓰고, 언제 쓰지 않나

| 상황 | 지연 평가 적용 |
|------|----------------|
| 무거운 계산이 분기 중 한쪽에서만 필요 | ✅ 강하게 권장 |
| 부수효과(로깅/throw/분석 이벤트)가 있는 분기 | ✅ 반드시 |
| 값이 **항상** 쓰이고 가벼움 | ❌ 불필요한 복잡도 |
| 리터럴 상수·단순 변수 참조 | ❌ 과도한 최적화 |
| "나중에 쓸지도 모르니까 전부 썽크로" | ❌ 안티패턴 |

---

## 2. 레이지 로드 (Lazy Load)

### 2.1 정의

**리소스(코드/이미지/데이터)를 초기 번들에 포함하지 않고, 필요한 시점에 네트워크/디스크에서 로드**하는 전략.
메모리나 실행이 아니라 **배포/전송 계층**의 최적화.

### 2.2 왜 필요한가

- 초기 번들이 커지면 **첫 로딩(TTI, First Contentful Paint)** 이 느려짐
- 사용자가 방문하지 않을 수도 있는 페이지·기능의 코드를 다 받을 필요 없음
- 스크롤 끝까지 가지 않는 이미지를 처음부터 다 받는 건 트래픽 낭비

### 2.3 JS 코드 레이지 로드

#### (a) 동적 `import()` — 런타임에 청크 요청

```js
button.onclick = async () => {
  const mod = await import('./heavy-feature.js');
  mod.run();
};
```

- Webpack/Next.js가 `heavy-feature.js`를 **별도 청크**로 분리
- 클릭 전까지는 해당 JS가 네트워크로 오지 않음

#### (b) `React.lazy` + `Suspense`

```jsx
const Chart = React.lazy(() => import('./Chart'));

function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      {showChart && <Chart />}
    </Suspense>
  );
}
```

- `showChart`가 true가 되는 순간 청크 요청
- 받는 동안 `fallback` 표시

#### (c) `next/dynamic` (Next.js 전용)

```jsx
const Menu = dynamic(() => import('src/components/MarkView/Menu'), {
  ssr: false,   // 서버 렌더 생략 (브라우저 전용 컴포넌트)
  loading: () => <Skeleton />,
});
```

- SSR 제어·로딩 UI·청크 분리가 한 번에 됨
- `find-pw.js`에서 이미 `DynamicMenu/DynamicSiteMap/DynamicFooter` 로 쓰고 있음

### 2.4 이미지 레이지 로드

#### (a) 네이티브 `loading="lazy"`

```html
<img src="big.jpg" loading="lazy" alt="..." />
```

- 브라우저가 뷰포트 근처일 때 자동으로 네트워크 요청
- 지원 브라우저 범위가 넓음

#### (b) `next/image`

```jsx
import Image from 'next/image';
<Image src="/big.jpg" alt="..." loading="lazy" />
```

- 포맷 변환(webp/avif), 사이즈 리사이즈, placeholder까지 기본 제공

#### (c) `IntersectionObserver` 수동 구현

- 라이브러리/브라우저 지원이 부족할 때 직접 뷰포트 감지

### 2.5 데이터 레이지 로드

- **무한 스크롤** — 페이지 단위로 API 호출 분할
- **가상 스크롤(Virtualization)** — 보이는 행만 렌더 (`react-window`, `react-virtualized`)
- **서버 컴포넌트/Streaming SSR** — 서버에서 조각조각 보내 첫 바이트를 앞당김

### 2.6 레이지 로드의 이점

1. **초기 번들 크기 감소** → TTI/LCP 개선
2. **필요 없는 기능 미배송** → 트래픽·비용 절감
3. **느슨한 의존** → 실험 기능을 분리해 실패 격리 가능

### 2.7 레이지 로드의 비용

- **첫 사용 시 지연** — 사용자가 기능을 쓰려는 순간 청크가 도착해야 함 → 스피너 필요
- **네트워크 왕복 추가** — 연결 상태가 나쁠 땐 오히려 나쁠 수 있음
- **워터폴 위험** — 컴포넌트 A가 로드된 뒤 B 요청이 시작되면 순차 지연 누적
- **프리페치 전략 필요** — 진짜 잘 쓰려면 `<link rel="prefetch">`·Next의 link prefetch를 병행해야 체감이 좋음

### 2.8 언제 쓰고, 언제 쓰지 않나

| 상황 | 레이지 로드 적용 |
|------|------------------|
| 큰 라이브러리(차트, 에디터, PDF)를 일부 페이지에서만 사용 | ✅ 강하게 권장 |
| 모달·팝업·사이드바처럼 조건부 UI | ✅ 권장 |
| SSR이 불가한 브라우저 전용 API 사용 컴포넌트 | ✅ (ssr: false와 세트) |
| 모든 페이지에서 쓰는 헤더/버튼/아이콘 | ❌ 오히려 청크 쪼개기 비용만 늘어남 |
| 매우 작은 컴포넌트(수 KB) | ❌ 분리 오버헤드가 실익 초과 |
| 사용자가 바로 쓸 확률 높은 기능 | ❌ 스피너만 체감됨 |

---

## 3. 두 개념의 정리 비교

| 구분 | 지연 평가 | 레이지 로드 |
|------|-----------|------------|
| 관심사 | **언제 실행할까** | **언제 다운로드할까** |
| 계층 | 런타임 / 언어 | 네트워크 / 빌드 산출물 |
| 수단 | 함수 래핑, 단락 평가, 제너레이터, 훅 | 동적 `import()`, `React.lazy`, `next/dynamic`, `loading="lazy"` |
| 이득 | CPU 시간·메모리·부수효과 방지 | 초기 번들 크기·TTI·트래픽 |
| 비용 | 함수 래퍼, 약간의 가독성 | 네트워크 왕복, 스피너 UX |
| 효과 확인 | 프로파일러, 콘솔 로그 | 번들 애널라이저, 네트워크 탭 |
| 적용 단위 | 표현식·함수·컴포넌트 렌더 | 청크·모듈·에셋 파일 |

---

## 4. 함께 쓰이는 경우

두 개념은 대립하지 않고 **직교(orthogonal)** 하다. 보통 겹쳐서 쓴다.

```jsx
// 레이지 로드: 청크 분리 + ssr 비활성
const HeavyModal = dynamic(() => import('./HeavyModal'), { ssr: false });

function Page({ show }) {
  // 지연 평가: show가 false면 <HeavyModal/> JSX 자체가 평가되지 않음
  //           (→ dynamic이 반환한 래퍼 컴포넌트조차 렌더 파이프라인에 들어가지 않음)
  return <div>{show && <HeavyModal />}</div>;
}
```

- `dynamic(...)` = **레이지 로드** (번들 분리)
- `show && <HeavyModal />` = **지연 평가** (렌더 트리에 넣는 시점 제어)

---

## 5. 실전 예시 — MarkView 프로젝트에서 뽑은 패턴들

> 모두 `frontend/app/src/` 안에 실제로 존재하는 코드 또는 그에 대한 개선 제안.

### 5.1 [지연 평가] 객체 매핑 dispatch — 현재 `find-pw.js`

**Before (엄격 평가 — 모든 분기 매 렌더 평가됨)**

```jsx
// pages/find-pw.js 203-221줄
const renderStep = () => {
  const components = {
    [STEP_ID.CONFIRM]: <ConfirmId idRef={idRef} checkUserId={handleUserIdcheck} />,
    [STEP_ID.AUTHENT]: (
      <SelfAuthentication
        nextStep={handleAuthentication}
        userEmail={userEmail}
        sendEmail={handleSendEmail}
        type={'pw'}
        text={{
          authTitle: t('self_auth_title'),       // ← 매 렌더마다 호출
          authDescPw: t('self_auth_desc_pw'),    // ← 매 렌더마다 호출
          authAction: t('self_auth_action'),     // ← 매 렌더마다 호출
        }}
      />
    ),
    [STEP_ID.UPDATE]: <UpdatePw setStep={handleChangeStep} impKey={impKey} />,
    [STEP_ID.SUCCESS]: <PwChangeSuccess judgeType={judgeType} />,
  };
  return components[stepName];
};
```

**After (썽크로 지연 평가)**

```jsx
const renderStep = () => {
  const components = {
    [STEP_ID.CONFIRM]: () => <ConfirmId idRef={idRef} checkUserId={handleUserIdcheck} />,
    [STEP_ID.AUTHENT]: () => (
      <SelfAuthentication
        nextStep={handleAuthentication}
        userEmail={userEmail}
        sendEmail={handleSendEmail}
        type={'pw'}
        text={{
          authTitle: t('self_auth_title'),
          authDescPw: t('self_auth_desc_pw'),
          authAction: t('self_auth_action'),
        }}
      />
    ),
    [STEP_ID.UPDATE]: () => <UpdatePw setStep={handleChangeStep} impKey={impKey} />,
    [STEP_ID.SUCCESS]: () => <PwChangeSuccess judgeType={judgeType} />,
  };
  return (components[stepName] ?? components[STEP_ID.CONFIRM])();
};
```

**어떤 상황에서 이 패턴?**
- 멀티스텝 폼 / 마법사(wizard) UI
- 상태값(문자열/enum)에 따라 렌더할 컴포넌트가 정해지는 경우
- 분기 내부에 `t()`, `format()`, 데이터 변환 등 **계산식이 포함**되어 있을 때
- 분기가 5개 이상이라 `&&` 나열이 시각적으로 난잡해질 때

---

### 5.2 [지연 평가] `useState` 초기화 — 무거운 초기값

**Before**

```jsx
// 매 렌더마다 makeDefaultParams() 실행됨. 그 결과는 최초에만 쓰이고 이후엔 버려짐
const [params, setParams] = useState(makeDefaultParams());
```

**After**

```jsx
// 최초 마운트 시 1회만 실행됨
const [params, setParams] = useState(() => makeDefaultParams());
```

**어떤 상황에서 이 패턴?**
- `src/lib/markview/dataStructure.js`의 `makeCurrentData` / `parameters`처럼 **초기값 계산이 큰 객체를 만드는** 경우
- localStorage/쿠키를 읽어 초기값을 만드는 경우 (동기 I/O라 무시 못 함)
- Date, UUID, 깊은 복제 등 **"한 번만 계산하면 되는데 매 렌더마다 호출되는"** 경우

---

### 5.3 [지연 평가] `useMemo` — 파생 계산 캐싱

**Before**

```jsx
// curData가 안 바뀌어도 다른 state가 바뀌면 sort가 매 렌더 실행됨
const sorted = [...curData].sort(byApplicationDate);
```

**After**

```jsx
const sorted = useMemo(
  () => [...curData].sort(byApplicationDate),
  [curData]
);
```

**어떤 상황에서 이 패턴?**
- `MarkList`에서 검색 결과 **정렬/필터링** 된 파생 배열
- `filterLogic.js`의 국가별 카운트 집계
- 렌더링 비용보다 계산 비용이 큰 경우 (n > 수백)

**주의**: 계산이 가벼우면 `useMemo` 자체 오버헤드(의존성 비교, 클로저 저장)가 더 클 수 있음. 정말 무거운 계산에만.

---

### 5.4 [지연 평가] 단락 평가로 JSX 분기 차단

```jsx
// Before — alertMsg가 문자열이든 빈 문자열이든 AlertBox 엘리먼트는 생성됨
{<AlertBox alt={alertMsg} okFn={() => setAlertMsg('')} />}

// After — alertMsg가 빈 문자열이면 AlertBox 생성 자체 안 됨
{alertMsg && <AlertBox alt={alertMsg} okFn={() => setAlertMsg('')} />}
```

`find-pw.js` 마지막 줄에서 이미 쓰고 있는 패턴.

**어떤 상황에서 이 패턴?**
- 알림창, 모달, 토스트 등 **조건부로만 렌더할 UI**
- 가장 단순하고 친숙한 지연 패턴. 분기 수가 2~3개 이하일 때 제일 가독성 좋음

---

### 5.5 [레이지 로드] 브라우저 전용 컴포넌트 — 현재 프로젝트 관행

```jsx
// pages/find-pw.js, sign-up.js, find-id.js 등 모든 일반 페이지에서 쓰고 있음
const DynamicMenu = dynamic(() => import('src/components/MarkView/Menu'), { ssr: false });
const DynamicSiteMap = dynamic(() => import('src/components/CommonComp/SiteMap'), { ssr: false });
const DynamicFooter = dynamic(() => import('src/components/CommonComp/Footer'), { ssr: false });
```

**어떤 상황에서 이 패턴?**
- 내부에 `window`, `localStorage`, `document` 접근이 있어 **SSR 시 에러**가 나는 컴포넌트
- 모든 페이지가 공유하지만 **페이지별 초기 렌더 경로에는 불필요**한 메뉴/사이드맵/푸터
- Hydration 불일치(서버가 만든 HTML과 클라 트리가 달라 생기는 경고)를 피하고 싶을 때

**MarkView 프로젝트 관행**: "메뉴/사이드맵/푸터는 `dynamic({ ssr: false })`" 이 전체 페이지에서 일관되게 지켜지고 있음. 새 페이지 만들 때도 이 관행을 따를 것.

---

### 5.6 [레이지 로드] 외부 무거운 라이브러리 — `main-legacy.js`

```jsx
// pages/main-legacy.js:31
const DynamicCountUp = dynamic(() => import('react-countup'), { ssr: false });
```

**어떤 상황에서 이 패턴?**
- **외부 라이브러리**가 수십~수백 KB인데 **한 화면에서만** 사용
- 사용자가 해당 요소를 보기까지 시간이 있는 경우(스크롤, 조건 충족 등)
- MarkView 예: 차트, 카운트업, PDF 뷰어, 이미지 크롭퍼

**선정 기준**:
- 번들 애널라이저(`next build --profile`)에서 **청크 상위권**에 있는 라이브러리 우선
- 라이브러리 크기가 100KB 넘어가면 진지하게 검토

---

### 5.7 [레이지 로드 + 지연 평가] 조건부 모달

```jsx
// 레이지 로드: 청크 분리
const ReportPopup = dynamic(() => import('./HelpBoxes/ReportPopup'));

function HelpBox({ openReport, ... }) {
  return (
    <div>
      {/* 지연 평가: openReport가 false면 ReportPopup 래퍼조차 렌더 트리에 안 들어감 */}
      {openReport && <ReportPopup ... />}
    </div>
  );
}
```

**어떤 상황에서 이 패턴?**
- 사용자가 **버튼을 눌러야만** 열리는 모달/팝업
- 모달 내부가 무겁거나(리포트 폼, 인쇄 미리보기) 외부 라이브러리를 씀
- 기본 상태에서 초기 번들에 실려 올 이유가 없음

MarkView 예시 후보: `ReportPopup`, `PrintingPage`, `FilterBox`, `EventModal`

---

### 5.8 [지연 평가] Generator로 무한/대용량 시퀀스

```js
// 특허번호 후보 생성기 (가상 예시)
function* candidateNumbers(prefix) {
  let n = 0;
  while (true) {
    yield `${prefix}-${String(n).padStart(7, '0')}`;
    n += 1;
  }
}

const gen = candidateNumbers('10');
// 첫 10개만 필요
const first10 = [];
for (let i = 0; i < 10; i++) first10.push(gen.next().value);
```

**어떤 상황에서 이 패턴?**
- 무한/가변 길이 시퀀스를 미리 만들지 않고 **필요한 만큼만 뽑아 쓰고 싶을 때**
- 페이지네이션 토큰, 후보 ID 자동 증가, 재귀적 데이터 탐색
- MarkView에서 당장 쓸 데는 많지 않지만 "대용량 데이터 스트리밍"을 다룰 때 유용

---

## 6. 상황별 선택 가이드

### 6.1 "분기마다 다른 컴포넌트를 보여주고 싶다" — 지연 평가 계열

| 분기 수 | 각 분기 내부 복잡도 | 추천 패턴 |
|--------|--------------------|----------|
| 2개 | 간단 | `cond ? <A/> : <B/>` 또는 `{cond && <A/>}` |
| 2~3개 | 간단 | `{flag && <A/>} {!flag && <B/>}` 나열 |
| 3~5개 | 간단 (함수 호출 없음) | 객체 매핑 (현재 `find-pw.js` 방식) — 함정 있지만 실익 0이면 허용 |
| 3~5개 | 내부에 `t()`, 계산식, 부수효과 | **썽크 매핑** (5.1 After) |
| 6개 이상 | 무관 | `switch` + 별도 함수 / 또는 각 분기를 컴포넌트로 분리 |
| 동적으로 추가·삭제되는 분기 | 무관 | 객체 매핑 (+ 썽크) 거의 강제. 배열+filter도 가능 |

### 6.2 "초기값이 무겁다" — 지연 평가 (useState 패턴)

```jsx
// ❌ 매 렌더마다 실행
useState(heavyInit())

// ✅ 최초 1회만 실행
useState(() => heavyInit())
```

**기준**:
- heavyInit이 **수 ms 이상 걸리면** 반드시 함수형
- localStorage/쿠키/JSON.parse 쓰면 무조건 함수형
- 상수나 단순 리터럴이면 굳이 함수형 아님

### 6.3 "파생 계산 캐싱" — useMemo

```jsx
const derived = useMemo(() => heavy(x, y), [x, y]);
```

**기준**:
- 원본 데이터가 500건 이상 + 정렬/필터/집계 → ✅
- 원본이 100건 미만 + 단순 `.map` → ❌ (오히려 useMemo 오버헤드)
- 참조 안정성(자식 컴포넌트 `React.memo` 최적화용)이 목적이면 크기 무관하게 ✅

### 6.4 "브라우저 전용 컴포넌트 or 일부 페이지에서만 무거운 외부 lib" — 레이지 로드

| 조건 | 쓸 것 |
|------|-------|
| SSR 시 에러 + 모든 페이지 공유 | `dynamic({ ssr: false })` (MarkView 관행) |
| SSR 가능 + 일부 페이지만 | `dynamic()` (ssr: true 기본) |
| React 표준 + Suspense로 감쌀 수 있음 | `React.lazy` + `Suspense` |
| 외부 lib(100KB+) + 한 화면에서만 | `dynamic(() => import('lib'), { ssr: false })` |

### 6.5 "이미지가 많다" — 레이지 로드

| 이미지 위치 | 쓸 것 |
|------------|-------|
| 스크롤 하단/접힌 영역 | `<img loading="lazy">` 또는 `<Image loading="lazy">` |
| 최상단 Hero, LCP 후보 | **레이지 로드 쓰지 말 것**. 오히려 `priority` / `fetchpriority="high"` |
| 상품 카드·리스트 | `next/image` + `loading="lazy"` 기본값 |

### 6.6 "데이터가 크다" — 레이지 로드 (데이터 분할)

| 상황 | 쓸 것 |
|------|-------|
| 검색 결과 수천 건 | 서버 페이지네이션(현재 `usePagination` 방식) |
| 긴 리스트 스크롤 | 가상 스크롤 (`react-window`) |
| 점진적 표시 | Intersection Observer + 추가 로드 |

---

## 7. 안티패턴 모음

### 7.1 "나중에 쓸지 모르니 전부 썽크"

```jsx
// ❌ 간단한 상수까지 감싸면 가독성 손해
const map = {
  a: () => 'hello',
  b: () => 'world',
};
```

상수·단순 리터럴은 원래 지연 평가 효과가 거의 없음. 감싸지 말 것.

### 7.2 "useMemo 남발"

```jsx
// ❌ 원시값 계산에 useMemo
const sum = useMemo(() => a + b, [a, b]);
```

`a + b` 자체보다 useMemo의 deps 비교 + 캐시 저장이 더 비쌈.

### 7.3 "dynamic 남발로 청크가 50개"

페이지 하나에서 10개씩 `dynamic`을 쓰면 청크 요청이 순차적으로 쌓여 **워터폴**이 생김. 핵심 청크는 프리페치(Next link prefetch)로 미리 받고, 정말 "지금 당장 안 보이는" 것만 dynamic.

### 7.4 "첫 화면 Hero 이미지에 `loading='lazy'`"

LCP(Largest Contentful Paint)가 Hero 이미지인 경우, `loading='lazy'`는 성능을 **악화**시킴. 명시적으로 `priority` 또는 `loading='eager'`.

### 7.5 "`switch`를 거부하고 무조건 객체 매핑"

`switch`는 **언어가 제공하는 지연 평가**라 썽크 없이도 안전하다. 객체 매핑은 가독성/유지보수성 때문에 고르는 거지, "항상 더 낫다"는 의미는 아님.

---

## 8. 이번 `find-pw.js` 케이스의 위치

| 관심사 | 판정 |
|--------|------|
| 레이지 로드 필요? | ❌ 4개 컴포넌트 모두 같은 페이지 도메인·가벼움. 오버엔지니어링 |
| 지연 평가 필요? | △ 현재는 `t()` 3회라 실익 0. 다만 `components = { ... }` 구조상 "전부 평가" 함정이 있으므로, 향후 무거운 식이 들어올 여지를 고려하면 썽크 매핑이 안전 |

→ 지금은 **그대로 두되 패턴의 함정을 팀이 공유**, 향후 내부 복잡도가 올라가면 썽크로 전환.

---

## 9. 자주 나오는 오해

| 오해 | 실제 |
|------|------|
| "객체 매핑은 `switch`처럼 해당 분기만 실행된다" | ❌ 객체 리터럴은 모든 value를 즉시 평가한다 |
| "지연 평가는 렌더링 속도를 눈에 띄게 빠르게 한다" | △ 보통은 μs 단위. 체감보다 "정확성" 이득이 큼 |
| "레이지 로드를 많이 쓸수록 빠르다" | ❌ 워터폴로 오히려 느려질 수 있음. 프리페치와 병행해야 함 |
| "지연 평가와 레이지 로드는 같은 거다" | ❌ 실행 시점 vs 전송 시점. 완전히 다른 계층 |
| "`() =>` 로 감싸기만 하면 항상 이득" | ❌ 항상 쓰이는 값을 감싸면 오히려 오버헤드와 가독성 손해 |

---

## 10. 한 줄 체크리스트

- **쓰이지 않는 분기의 부수효과가 신경 쓰이는가** → 지연 평가(썽크)
- **번들을 줄이고 싶거나 SSR을 끄고 싶은가** → 레이지 로드(`dynamic`/`React.lazy`)
- **둘 다인가** → 둘 다 쓰면 된다. 충돌하지 않는다.
- **그냥 가벼운 값인가** → 아무것도 하지 말 것.
