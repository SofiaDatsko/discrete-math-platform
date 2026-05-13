import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>🧠 {t('header_title')}</h1>
      <p>{t('home_welcome_text') || "Ласкаво просимо на інтерактивну платформу для вивчення та практики дискретної математики."}</p>

      <p>{t('home_find_everything') || "На цьому сайті ти знайдеш усе необхідне для розуміння ключових тем:"}</p>

      <ul>
        <li>🧮 <strong>{t('calculators')}</strong> — {t('home_calc_desc') || "автоматичні інструменти для розв'язання задач:"}</li>
        <ul>
          <li>🔗 <strong>{t('graphs')}</strong> — {t('home_graphs_desc') || "побудова, візуалізація та аналіз графів, алгоритми пошуку."}</li>
          <li>🧠 <strong>{t('logic')}</strong> — {t('home_logic_desc') || "булева алгебра, спрощення виразів, таблиці істинності."}</li>
          <li>🎲 <strong>{t('combinatorics')}</strong> — {t('home_comb_desc') || "обчислення перестановок, комбінацій і розміщень."}</li>
          <li>🔵 <strong>{t('venn')}</strong> — {t('home_venn_desc') || "побудова й візуалізація множин."}</li>
        </ul>

        <li>📚 <strong>{t('learning')}</strong> — {t('home_learning_desc') || "теорія та практика у зручному форматі:"}</li>
        <ul>
          <li>🧠 {t('logic')}</li>
          <li>🔵 {t('venn')}</li>
        </ul>

        <li>📝 <strong>{t('tests')}</strong> — {t('home_test_desc') || "перевірка знань з різних тем у форматі тестів."}</li>
        <li>💬 <strong>{t('forum')}</strong> — {t('home_forum_desc') || "став запитання, обговорюй задачі та ділись досвідом з іншими."}</li>
      </ul>

      <p>🧭 {t('home_footer_hint') || "Скористайся меню зліва, щоб обрати потрібний розділ і розпочати навчання або практику."}</p>
    </div>
  );
}