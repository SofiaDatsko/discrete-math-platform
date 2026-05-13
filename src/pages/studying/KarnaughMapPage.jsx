import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Імпорт хука
import './DnfPractice.css'; 

export default function KarnaughMapPage() {
  const { t } = useTranslation(); // Ініціалізація перекладу
  const [expression, setExpression] = useState('');
  const [variableCount, setVariableCount] = useState(3);
  const [kmap, setKmap] = useState(generateKMap(3));
  const [feedback, setFeedback] = useState('');
  const [minimizedMDNF, setMinimizedMDNF] = useState('');
  const [minimizedMKNF, setMinimizedMKNF] = useState('');
  const [mode, setMode] = useState('custom');

  function generateKMap(vars) {
    if (vars === 2) return Array(2).fill(null).map(() => Array(2).fill(0));
    if (vars === 3) return Array(2).fill(null).map(() => Array(4).fill(0));
    if (vars === 4) return Array(4).fill(null).map(() => Array(4).fill(0));
    return [[]];
  }

  function getHeaderLabels(vars) {
    if (vars === 2) return ['p̄', 'p'];
    if (vars === 3) return ['p̄q̄', 'p̄q', 'pq', 'pq̄'];
    if (vars === 4) return ['p̄q̄', 'p̄q', 'pq', 'pq̄'];
    return [];
  }

  function getRowLabels(vars) {
    if (vars === 2) return ['q', 'q̄'];
    if (vars === 3) return ['r', 'r̄'];
    if (vars === 4) return ['r̄s̄', 'r̄s', 'rs', 'rs̄'];
    return [];
  }

  function generateRandomExpression(vars) {
    const terms = [];
    const numTerms = Math.floor(Math.random() * 4 + 2);
    for (let i = 0; i < numTerms; i++) {
      let term = '';
      ['p', 'q', 'r', 's'].slice(0, vars).forEach(v => {
        term += Math.random() > 0.5 ? v : v + '̄';
      });
      terms.push(term);
    }
    return terms.join(' ∨ ');
  }

  const handleChangeVars = (count) => {
    setVariableCount(count);
    setKmap(generateKMap(count));
    setFeedback('');
    setMinimizedMDNF('');
    setMinimizedMKNF('');
    if (mode === 'random') {
      const randExpr = generateRandomExpression(count);
      setExpression(randExpr);
    } else {
      setExpression('');
    }
  };

  const handleCellClick = (row, col) => {
    const updated = kmap.map((r, i) =>
      i === row ? r.map((val, j) => j === col ? (val === 1 ? 0 : 1) : val) : r
    );
    setKmap(updated);
  };

  function minimizeByValue(kmap, variableCount, targetValue) {
    const cells = [];
    for (let r = 0; r < kmap.length; r++) {
      for (let c = 0; c < kmap[r].length; c++) {
        if (kmap[r][c] === targetValue) {
          cells.push({ r, c });
        }
      }
    }

    if (cells.length === 0) return targetValue === 1 ? '0' : '1';
    if (cells.length === kmap.length * kmap[0].length) return targetValue === 1 ? '1' : '0';

    const varNames = ['p', 'q', 'r', 's'];
    const grayCode2 = [0, 1, 3, 2];
    const grayCode1 = [0, 1];

    function cellToVars(r, c, vars) {
      if (vars === 2) return { p: c, q: r };
      if (vars === 3) {
        let rV = grayCode1[r];
        let pq = grayCode2[c];
        let p = (pq & 2) >> 1;
        let q = pq & 1;
        return { p, q, r: rV };
      }
      if (vars === 4) {
        let rs = grayCode2[r];
        let pq = grayCode2[c];
        let p = (pq & 2) >> 1;
        let q = pq & 1;
        let rV = (rs & 2) >> 1;
        let s = rs & 1;
        return { p, q, r: rV, s };
      }
    }

    function combineTerms(a, b) {
      const keys = Object.keys(a);
      let diffCount = 0;
      let diffKey = null;
      for (const k of keys) {
        if (a[k] !== b[k]) {
          diffCount++;
          diffKey = k;
        }
      }
      if (diffCount === 1) {
        const term = {};
        for (const k of keys) {
          if (k !== diffKey) term[k] = a[k];
        }
        return term;
      }
      return null;
    }

    let terms = cells.map(({ r, c }) => cellToVars(r, c, variableCount));
    let combined = [];
    let used = new Array(terms.length).fill(false);

    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        const combinedTerm = combineTerms(terms[i], terms[j]);
        if (combinedTerm) {
          combined.push(combinedTerm);
          used[i] = true;
          used[j] = true;
        }
      }
    }

    const primeImplicants = [];
    for (let i = 0; i < terms.length; i++) {
      if (!used[i]) primeImplicants.push(terms[i]);
    }
    primeImplicants.push(...combined);

    function termToString(term) {
      const parts = [];
      for (const v of varNames.slice(0, variableCount)) {
        if (!(v in term)) continue;
        if (targetValue === 1) {
          parts.push(term[v] === 1 ? v : v + '̄');
        } else {
          parts.push(term[v] === 0 ? v : v + '̄');
        }
      }
      if (parts.length === 0) return targetValue === 1 ? '1' : '0';
      return targetValue === 1 ? parts.join('') : '(' + parts.join(' ∨ ') + ')';
    }

    const uniqueTerms = Array.from(new Set(primeImplicants.map(t => termToString(t))));
    return targetValue === 1 ? uniqueTerms.join(' ∨ ') : uniqueTerms.join(' ∧ ');
  }

  const handleCheck = () => {
    const mdnf = minimizeByValue(kmap, variableCount, 1);
    const mknf = minimizeByValue(kmap, variableCount, 0);
    setMinimizedMDNF(mdnf);
    setMinimizedMKNF(mknf);
    setFeedback(t('karno_feedback_complete'));
  };

  const handleReset = () => {
    setKmap(generateKMap(variableCount));
    setFeedback('');
    setMinimizedMDNF('');
    setMinimizedMKNF('');
    if (mode === 'random') setExpression(generateRandomExpression(variableCount));
    else setExpression('');
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'random') {
      setExpression(generateRandomExpression(variableCount));
    } else {
      setExpression('');
    }
    handleReset();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>{t('karno_title')}</h1>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>{t('karno_mode_label')}:</label>
        <button
          onClick={() => toggleMode('custom')}
          style={{
            marginRight: '8px',
            padding: '6px 12px',
            backgroundColor: mode === 'custom' ? '#1976d2' : '#ccc',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
          {t('karno_mode_custom')}
        </button>
        <button
          onClick={() => toggleMode('random')}
          style={{
            padding: '6px 12px',
            backgroundColor: mode === 'random' ? '#1976d2' : '#ccc',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
          {t('karno_mode_random')}
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>{t('karno_vars_label')}:</label>
        {[2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => handleChangeVars(n)}
            style={{
              marginRight: '8px',
              padding: '6px 12px',
              backgroundColor: variableCount === n ? '#1976d2' : '#ccc',
              color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}>
            {n}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="expression" style={{ display: 'block', marginBottom: '8px' }}>{t('logic_input_label')}</label>
        <input
          id="expression" type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          disabled={mode === 'random'}
          placeholder={t('logic_placeholder')}
          style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{t('karno_table_title')}:</div>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th></th>
              {getHeaderLabels(variableCount).map((label, i) => (
                <th key={i} style={{ padding: '4px 8px', textAlign: 'center' }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getRowLabels(variableCount).map((rowLabel, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{ paddingRight: '8px', fontWeight: 'bold' }}>{rowLabel}</td>
                {kmap[rowIdx].map((val, colIdx) => (
                  <td
                    key={colIdx}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    style={{
                      border: '1px solid #ccc', width: '40px', height: '40px',
                      textAlign: 'center', cursor: 'pointer',
                      backgroundColor: val ? '#c8e6c9' : '#f5f5f5', fontSize: '18px'
                    }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button onClick={handleCheck} style={{ marginRight: '10px', padding: '8px 16px', fontSize: '16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {t('tp_check_btn')}
        </button>
        <button onClick={handleReset} style={{ padding: '8px 16px', fontSize: '16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {t('venn_btn_clear')}
        </button>
      </div>

      {feedback && <div style={{ fontSize: '18px', marginBottom: '10px' }}>{feedback}</div>}
      {minimizedMDNF && (
        <div style={{ fontSize: '16px', marginBottom: '6px' }}>
          {t('karno_res_mdnf')}: <strong>{minimizedMDNF}</strong>
        </div>
      )}
      {minimizedMKNF && (
        <div style={{ fontSize: '16px' }}>
          {t('karno_res_mknf')}: <strong>{minimizedMKNF}</strong>
        </div>
      )}
    </div>
  );
}