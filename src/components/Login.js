import React, { useRef } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useTranslation } from 'react-i18next';

function Login({ setUser }) {
  const { t } = useTranslation();
  const buttonRef = useRef();

  const handleLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();

    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        if (error.code === 'auth/popup-blocked') {
          alert('Будь ласка, дозвольте спливаючі вікна для цього сайту в налаштуваннях браузера');
        }
        console.error('Помилка входу:', error.code);
      });
  };

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleLogin}
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