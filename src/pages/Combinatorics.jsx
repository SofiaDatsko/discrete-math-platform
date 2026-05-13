import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 
import './Combinatorics.css';

export default function Combinatorics() {
  const { t } = useTranslation(); 
  const [n, setN] = useState('');
  const [k, setK] = useState('');
  const [result, setResult] = useState(null);
  const [calcType, setCalcType] = useState('combinations');
  const [error, setError] = useState('');

  // Функції обчислень
  function factorial(x) { if (x < 0 || x > 170) return Infinity; if (x === 0) return 1; let res = 1; for (let i = 2; i <= x; i++) res *= i; return res; }
  function combinations(n, k) { if (k < 0 || k > n) return 0; return factorial(n) / (factorial(k) * factorial(n - k)); }
  function permutations(n) { if (n < 0) return 0; return factorial(n); }
  function arrangements(n, k) { if (k < 0 || k > n) return 0; return factorial(n) / factorial(n - k); }

  function handleCalculate() {
    setError('');
    const N = Number(n); const K = Number(k);
    if (isNaN(N) || N < 0 || !Number.isInteger(N) || (calcType !== 'permutations' && (isNaN(K) || K < 0 || !Number.isInteger(K)))) {
      setError(t('comb_error_integers')); 
      setResult(null); return;
    }
    if (calcType !== 'permutations' && K > N) {
      setError(t('comb_error_k_greater_n')); 
      setResult(null); return;
    }
    let res;
    if (calcType === 'combinations') res = combinations(N, K);
    else if (calcType === 'permutations') res = permutations(N);
    else if (calcType === 'arrangements') res = arrangements(N, K);
    setResult(res);
  }

  const handleTypeChange = (type) => {
    setCalcType(type); setResult(null); setError(''); setN(''); setK('');
  };


  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      const originalBackgroundColor = mainElement.style.backgroundColor;
      mainElement.style.backgroundColor = '#f8fafc';
      return () => {
        mainElement.style.backgroundColor = originalBackgroundColor;
      };
    }
  }, []);

  // Ключі для типів калькулятора (titles)
  const calcTypes = ['combinations', 'permutations', 'arrangements'];

  return (
    <div className="calculator-container">
      <div className="calculator-card">
        <h1>{t('comb_calc_title')}</h1>
        <div className="type-selector">
          {calcTypes.map(key => (
            <button 
              key={key} 
              className={`calc-type-btn ${calcType === key ? 'active' : ''}`} 
              onClick={() => handleTypeChange(key)}
            >
              {t(`comb_${key}_title`)}
            </button>
          ))}
        </div>
        <div className="input-area">
          <input 
            type="number" 
            value={n} 
            onChange={(e) => setN(e.target.value)} 
            placeholder={t('comb_placeholder_n')} 
            className="styled-input" 
            min="0"
          />
          {calcType !== 'permutations' && (
            <input 
              type="number" 
              value={k} 
              onChange={(e) => setK(e.target.value)} 
              placeholder={t('comb_placeholder_k')} 
              className="styled-input" 
              min="0"
            />
          )}
        </div>
        <button onClick={handleCalculate} className="calculate-btn">{t('comb_calculate_btn')}</button>
        {error && <p className="error-message">{error}</p>}
        {result !== null && (
          <div className="result-display" key={result}>
            <p>{t('comb_result_label')}:</p>
            <span className="result-value">{result.toLocaleString(t('lang_locale'))}</span>
          </div>
        )}
      </div>

      <div className="formula-explanation">
        <h2>{t(`comb_${calcType}_title`)}</h2>
        <p className="description">{t(`comb_${calcType}_desc`)}</p>
        <p className="formula">{t(`comb_${calcType}_formula`)}</p>
        <p className="example">{t(`comb_${calcType}_example`)}</p>
      </div>
    </div>
  );
}