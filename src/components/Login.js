import React from 'react';
import { signInWithRedirect } from 'firebase/auth'; // Змінено на Redirect
import { auth, provider } from '../firebase';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();

  const handleLogin = () => {
    // Браузер ніколи не заблокує цей метод, бо це не спливаюче вікно
    signInWithRedirect(auth, provider)
      .catch((error) => {
        console.error('Login error:', error);
      });
  };

  return (
    <button 
      onClick={handleLogin}
      className="login-btn"
      style={{
        padding: '8px 16px',
        backgroundColor: '#fff',
        color: '#1976d2',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      {t('login_google')}
    </button>
  );
}

export default Login;