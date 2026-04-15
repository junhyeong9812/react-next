import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 인위적 지연으로 깜빡임 체감 강화
    const t = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
      }
      setChecked(true);
    }, 300);
    return () => clearTimeout(t);
  }, [navigate]);

  if (!checked) return <div style={{ padding: 24 }}>Loading...</div>;
  return children;
}
