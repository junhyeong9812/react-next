# 05-middleware/react — ProtectedRoute (클라 판단)

## 구현

```tsx
// ProtectedRoute.tsx
function ProtectedRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login', { replace: true });
    setChecked(true);
  }, []);

  if (!checked) return <div>Loading...</div>;
  return children;
}

// router
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

## 예상 결과

- `curl -I http://localhost:3501/dashboard` → `200 OK`
- HTML 받은 후 JS 실행 → 토큰 없음 → 리다이렉트
- Slow 3G throttling에서 **Dashboard 레이아웃이 수백 ms 동안 깜빡임**
