import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth'; // Додано getRedirectResult
import { auth } from './firebase';
import { useTranslation } from 'react-i18next';

// Імпорти сторінок залишаються без змін...
import Home from './pages/Home';
import Graphs from './pages/Graphs';
import Logic from './pages/Logic';
import Combinatorics from './pages/Combinatorics';
import Testing from './pages/Testing';
import VennDiagram from './pages/VennDiagram';
import SidebarMenu from './components/SidebarMenu';
import History from './pages/History';
import Forum from './pages/Forum';
import Login from './components/Login';
import LogicPage from './pages/studying/LogicPage';
import { LogicTheory } from './pages/studying/LogicTheory';
import { LogicPractice } from './pages/studying/LogicPractice';
import TruthTablePractice from './pages/studying/TruthTablePractice';
import DnfPractice from './pages/studying/DnfPractice';
import CnfPractice from './pages/studying/CnfPractice';
import ZhegalkinPractice from './pages/studying/ZhegalkinPractice';
import MinimizeDNFPractice from './pages/studying/MinimizeDnfPractice';
import MinimizeCNFPractice from './pages/studying/MinimizeCnfPractice';
import KarnaughMapPage from './pages/studying/KarnaughMapPage';
import VennPage from './pages/studying/VennPage';
import { VennTheory } from './pages/studying/VennTheory';
import { VennPractice } from './pages/studying/VennPractice';
import LanguageSwitcher from './components/LanguageSwitcher';

function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setOpen(false);
      navigate('/');
    });
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
      <span>{t('hi')}, {user.displayName}</span>
      <span onClick={() => setOpen(!open)} style={{ fontSize: 24, userSelect: 'none', padding: '4px 8px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        👤
      </span>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: 6, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', minWidth: 160, zIndex: 1000 }}>
          <Link to="/history" style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#333', borderBottom: '1px solid #eee' }} onClick={() => setOpen(false)}>
            {t('history_title')}
          </Link>
          <button onClick={handleSignOut} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#333' }}>
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // 1. Обробка повернення з Google Auth
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Помилка редіректу:", error);
      });

    // 2. Слухач стану користувача
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
  });
  return () => unsubscribe();
}, []);

  useEffect(() => {
    document.title = t('header_title');
  }, [t, i18n.language]);

  return (
    <Router>
      <div className="app-container">
        <nav className="top-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#1976d2', color: 'white' }}>
          <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
            🧠 {t('header_title')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <LanguageSwitcher />
            {user ? <UserMenu user={user} /> : <Login setUser={setUser} />}
          </div>
        </nav>

        <div className="content-wrapper" style={{ display: 'flex' }}>
          <SidebarMenu />
          <main style={{ flexGrow: 1, padding: 20 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/graphs" element={<Graphs />} />
              <Route path="/logic" element={<Logic />} />
              <Route path="/combinatorics" element={<Combinatorics />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/venn" element={<VennDiagram />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/history" element={<History />} />
              <Route path="/studying/logic" element={<LogicPage />}>
                <Route path="theory/:topicId?" element={<LogicTheory />} />
                <Route path="practice" element={<LogicPractice />} />
              </Route>
              <Route path="/studying/venn" element={<VennPage />}>
                <Route path="theory" element={<VennTheory />} />
                <Route path="practice" element={<VennPractice />} />
              </Route>
              <Route path="/studying/truth-table" element={<TruthTablePractice />} />
              <Route path="/studying/dnf" element={<DnfPractice />} />
              <Route path="/studying/cnf" element={<CnfPractice />} />
              <Route path="/studying/zhegalkin" element={<ZhegalkinPractice />} />
              <Route path="/studying/minimize-dnf" element={<MinimizeDNFPractice />} />
              <Route path="/studying/minimize-cnf" element={<MinimizeCNFPractice />} />
              <Route path="/studying/karnaugh" element={<KarnaughMapPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;