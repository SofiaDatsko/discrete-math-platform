import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Імпортуємо хук перекладу
import './LogicPractice.css';

export function LogicPractice() {
  const { t } = useTranslation(); // Ініціалізуємо функцію перекладу

  // Переносимо дані в масив всередині компонента, щоб використовувати t()
  const practiceTopics = [
    { path: '/studying/truth-table', label: 'truth_table_title', desc: 'truth_table_desc' },
    { path: '/studying/dnf', label: 'ddnf_title', desc: 'ddnf_desc' },
    { path: '/studying/cnf', label: 'dknf_title', desc: 'dknf_desc' },
    { path: '/studying/zhegalkin', label: 'zhegalkin_title', desc: 'zhegalkin_desc' },
    { path: '/studying/minimize-dnf', label: 'min_dnf_title', desc: 'min_dnf_desc' },
    { path: '/studying/minimize-cnf', label: 'min_knf_title', desc: 'min_knf_desc' },
    { path: '/studying/karnaugh', label: 'karno_title', desc: 'karno_desc' },
  ];

  return (
    <div className="practice-container">
      {/* Заголовок та опис сторінки */}
      <h2>🧪 {t('logic_practice_title')}</h2>
      <p>{t('logic_practice_desc')}</p>
      
      <div className="practice-grid">
        {practiceTopics.map((topic, idx) => (
          <Link to={topic.path} key={idx} className="practice-card">
            {/* Рендеримо перекладені заголовки та описи кожної картки */}
            <h3>{t(topic.label)}</h3>
            <p>{t(topic.desc)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}