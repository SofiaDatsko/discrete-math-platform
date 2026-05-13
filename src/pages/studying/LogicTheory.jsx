import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import './LogicTheory.css';

export function LogicTheory() {
  const { topicId } = useParams();
  const { t } = useTranslation();

  // Динамічний список тем для головної сторінки
  const topicKeys = ['truthTable', 'dnfCnf', 'zhegalkin', 'minimize', 'karnaugh', 'postClasses'];

  if (!topicId) {
    return (
      <div className="theory-container">
        <h2>📘 {t('theory_logic_title')}</h2>
        <ul className="topic-list">
          {topicKeys.map((key) => (
            <li key={key}>
              <Link to={key} className="topic-link">
                🔹 {t(`topics.${key}.title`)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Перевірка наявності теми
  if (!topicKeys.includes(topicId)) {
    return <p>{t('topic_not_found')}</p>;
  }

  return (
    <div className="theory-container">
      <h2>📘 {t(`topics.${topicId}.title`)}</h2>
      
      <div className="topic-content">
        {/* Використовуємо Trans для рендерингу складного контенту з тегами */}
        <Trans i18nKey={`topics.${topicId}.content`}>
          {/* Це дефолтний контент, який буде замінено перекладом */}
          <p>Loading...</p>
        </Trans>

        {/* Спеціальна обробка для таблиці істинності, якщо вона потрібна всередині контенту */}
        {topicId === 'truthTable' && (
          <table className="logic-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>A ∧ B</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0</td><td>0</td><td>0</td></tr>
              <tr><td>0</td><td>1</td><td>0</td></tr>
              <tr><td>1</td><td>0</td><td>0</td></tr>
              <tr><td>1</td><td>1</td><td>1</td></tr>
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: '20px' }}>
        <Link to=".." relative="path" className="back-link">
          ← {t('back_to_list')}
        </Link>
      </p>
    </div>
  );
}