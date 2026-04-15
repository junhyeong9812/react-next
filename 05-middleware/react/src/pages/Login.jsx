import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    document.cookie = 'access_token=demo; path=/';
    localStorage.setItem('token', 'demo');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('token');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Login (React)</h1>
      <button onClick={handleLogin}>로그인</button>
      <button onClick={handleLogout} style={{ marginLeft: 8 }}>로그아웃</button>
    </div>
  );
}
