import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher" style={{ display: 'flex', gap: '8px', marginRight: '15px' }}>
      <button 
        onClick={() => changeLanguage('ua')}
        className={`lang-btn ${i18n.language === 'ua' ? 'active' : ''}`}
        style={{
          background: 'transparent',
          color: 'white',
          border: i18n.language === 'ua' ? '1px solid white' : 'none',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        UA
      </button>
      <button 
        onClick={() => changeLanguage('en')}
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        style={{
          background: 'transparent',
          color: 'white',
          border: i18n.language === 'en' ? '1px solid white' : 'none',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;