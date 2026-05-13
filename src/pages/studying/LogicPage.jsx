import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Додано для перекладу

export default function LogicPage() {
  const location = useLocation();
  const { t } = useTranslation(); // Хук перекладу

  return (
    <div>
      {/* Заголовок секції навчання логіки */}
      <h2>🧠 {t('logic')} — {t('learning')}</h2>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {/* Посилання на теорію */}
        <Link to="theory" style={{
          padding: '8px 16px',
          borderRadius: 6,
          backgroundColor: location.pathname.includes('/theory') ? '#1976d2' : '#eee',
          color: location.pathname.includes('/theory') ? 'white' : 'black',
          textDecoration: 'none'
        }}>📘 {t('theory')}</Link>

        {/* Посилання на практику */}
        <Link to="practice" style={{
          padding: '8px 16px',
          borderRadius: 6,
          backgroundColor: location.pathname.includes('/practice') ? '#1976d2' : '#eee',
          color: location.pathname.includes('/practice') ? 'white' : 'black',
          textDecoration: 'none'
        }}>🧪 {t('practice')}</Link>
      </div>

      {/* Тут рендеритимуться вкладені маршрути (LogicTheory або LogicPractice) */}
      <Outlet />
    </div>
  );
}