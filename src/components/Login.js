import React from 'react';
import { signInWithRedirect } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useTranslation } from 'react-i18next';

function Login({ setUser }) {
  const { t } = useTranslation();

  const handleLogin = () => {
    signInWithRedirect(auth, provider);
  };

  return (
    <button
      onClick={handleLogin}
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