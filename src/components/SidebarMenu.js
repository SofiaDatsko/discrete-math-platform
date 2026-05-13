import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Імпортуємо хук перекладу
import './SidebarMenu.css';

function SidebarMenu() {
  const { t } = useTranslation(); // Ініціалізуємо функцію перекладу
  const location = useLocation();
  const [isCalculatorsOpen, setCalculatorsOpen] = useState(false);
  const [isStudyingOpen, setStudyingOpen] = useState(false);

  const toggleCalculators = () => setCalculatorsOpen(!isCalculatorsOpen);
  const toggleStudying = () => setStudyingOpen(!isStudyingOpen);

  return (
    <aside className="sidebar">
      {/* Головне меню */}
      <Link
        to="/"
        className={`tile ${location.pathname === '/' ? 'active' : ''} main-tile`}
      >
        <img src="https://img.icons8.com/fluency/48/home.png" alt="icon" className="menu-icon" />
        {t('main_menu')}
      </Link>

      {/* Калькулятори */}
      <div className="tile submenu-toggle" onClick={toggleCalculators}>
        <img src="https://img.icons8.com/dusk/64/calculator.png" alt="icon" className="menu-icon" />
        {t('calculators')}
        <span className="arrow">{isCalculatorsOpen ? '▲' : '▼'}</span>
      </div>

      {isCalculatorsOpen && (
        <div className="submenu">
          <Link to="/graphs" className={`tile sub-tile ${location.pathname === '/graphs' ? 'active' : ''}`}>
            <img src="https://img.icons8.com/color/48/graph.png" alt="icon" className="menu-icon" />
            {t('graphs')}
          </Link>
          <Link to="/logic" className={`tile sub-tile ${location.pathname === '/logic' ? 'active' : ''}`}>
            <img src="https://img.icons8.com/external-color-outline-adri-ansyah/64/external-startup-startup-and-new-business-color-outline-adri-ansyah-8.png" alt="icon" className="menu-icon" />
            {t('logic')}
          </Link>
          <Link to="/combinatorics" className={`tile sub-tile ${location.pathname === '/combinatorics' ? 'active' : ''}`}>
            <img src="https://img.icons8.com/color/48/apple-calculator.png" alt="icon" className="menu-icon" />
            {t('combinatorics')}
          </Link>
          <Link to="/venn" className={`tile sub-tile ${location.pathname === '/venn' ? 'active' : ''}`}>
            <img src="https://img.icons8.com/office/40/venn-diagram.png" alt="icon" className="menu-icon" />
            {t('venn')}
          </Link>
        </div>
      )}

      {/* Навчання */}
      <div className="tile submenu-toggle" onClick={toggleStudying}>
        <img src="https://img.icons8.com/plasticine/100/saving-book.png" alt="icon" className="menu-icon" />
        {t('learning')}
        <span className="arrow">{isStudyingOpen ? '▲' : '▼'}</span>
      </div>

      {isStudyingOpen && (
        <div className="submenu">
          <Link
            to="/studying/logic"
            className={`tile sub-tile ${location.pathname === '/studying/logic' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <img src="https://img.icons8.com/nolan/64/logic-gates-or.png" className="menu-icon" alt="icon" />
            {t('logic')}
          </Link>

          <Link
            to="/studying/venn/theory"
            className={`tile sub-tile ${location.pathname.includes('/studying/venn') ? 'active' : ''}`}
          >
            <img src="https://img.icons8.com/doodle/48/venn-diagram.png" className="menu-icon" alt="icon" />
            {t('venn')}
          </Link>
        </div>
      )}

      {/* Тести */}
      <Link
        to="/testing"
        className={`tile ${location.pathname === '/testing' ? 'active' : ''}`}
      >
        <img src="https://img.icons8.com/fluency/48/test--v1.png" alt="icon" className="menu-icon" />
        {t('tests')}
      </Link>

      {/* Форум */}
      <Link
        to="/forum"
        className={`tile ${location.pathname === '/forum' ? 'active' : ''}`}
      >
        <img src="https://img.icons8.com/color/100/people-working-together.png" alt="icon" className="menu-icon" />
        {t('forum')}
      </Link>
    </aside>
  );
}

export default SidebarMenu;