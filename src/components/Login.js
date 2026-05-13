import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useTranslation } from 'react-i18next';

function Login({ setUser }) {
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Помилка входу:', error);
    }
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