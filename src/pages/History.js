import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useTranslation } from "react-i18next"; 

function History() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/logic/${auth.currentUser.uid}`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error loading history:", error);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!auth.currentUser) return;
    if (!window.confirm(t('history_confirm_clear'))) return; // Додано підтвердження
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/logic/${auth.currentUser.uid}`);
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="history-container">
      <h2>🕓 {t('history_title')}</h2>
      
      <button 
        onClick={clearHistory} 
        disabled={loading || history.length === 0}
        className="btn-clear-history"
      >
        {t('history_clear_btn')}
      </button>

      {loading && <p>{t('loading')}...</p>}

      <ul className="history-list">
        {history.length === 0 && !loading && (
          <li>{t('history_empty')}</li>
        )}
        
        {history.map(item => (
          <li key={item._id} className="history-item">
            {/* t(`type_${item.type}`) дозволяє перекладати типи запитів із бази даних */}
            <strong>{t(`type_${item.type}`) || item.type}</strong>: 
            <span className="expr"> {item.expression}</span> → 
            <span className="res"> {item.result}</span>
            <br />
            <small className="date">
              {new Date(item.timestamp).toLocaleString(t('lang_locale'))}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default History;