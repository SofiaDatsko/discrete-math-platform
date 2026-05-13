import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useTranslation } from 'react-i18next'; //

function Login({ setUser }) {
  const { t } = useTranslation(); //

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        // Використовуємо консоль для розробника, текст помилки можна залишити технічним
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
      {/* Замінюємо статичний текст на ключ з i18n.js */}
      {t('login_google')} {/* */}
    </button>
  );
}

export default Login;
