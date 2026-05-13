import React from 'react';
import { signInWithRedirect, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useTranslation } from 'react-i18next';

function Login({ setUser }) {
  const { t } = useTranslation();

  const handleLogin = () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithRedirect(auth, provider);
      })
      .catch((error) => {
        console.error('Persistence error:', error.code);
      });
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