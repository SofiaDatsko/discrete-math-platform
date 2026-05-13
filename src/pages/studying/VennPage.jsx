import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Імпортуємо хук перекладу
import './VennPractice.css';

function VennPage() {
  const location = useLocation();
  const { t } = useTranslation(); // Ініціалізуємо t

  return (
    <div className="logic-page">
      <div className="topic-tabs">
        <Link
          to="theory"
          className={`tab ${location.pathname.includes('/theory') ? 'active' : ''}`}
        >
          📘 {t('theory')}
        </Link>
        <Link
          to="practice"
          className={`tab ${location.pathname.includes('/practice') ? 'active' : ''}`}
        >
          🧪 {t('practice')}
        </Link>
      </div>
      <Outlet />
    </div>
  );
}

export default VennPage;