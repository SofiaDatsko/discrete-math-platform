import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Додано для перекладу
import './DnfPractice.css'; 

function generateTruthTable(vars) {
  const n = vars.length;
  const rows = 2 ** n;
  const table = [];
  for (let i = 0; i < rows; i++) {
    const inputs = [];
    for (let j = n - 1; j >= 0; j--) {
      inputs.push((i >> j) & 1);
    }
    table.push({ inputs, value: Math.round(Math.random()) });
  }
  return table;
}

function buildInitialCNF(truthTable, vars) {
  const terms = [];
  truthTable.forEach(({ inputs, value }) => {
    if (value === 0) {
      const termParts = inputs.map((bit, i) =>
        bit === 0 ? vars[i] : `¬${vars[i]}`
      );
      terms.push(termParts);
    }
  });
  return terms;
}

function canCombine(termA, termB) {
  let diffCount = 0;
  let diffIndex = -1;
  for (let i = 0; i < termA.length; i++) {
    if (termA[i] !== termB[i]) {
      diffCount++;
      diffIndex = i;
      if (diffCount > 1) return -1;
    }
  }
  return diffCount === 1 ? diffIndex : -1;
}

function combineTerms(termA, termB) {
  const diffIndex = canCombine(termA, termB);
  if (diffIndex === -1) return null;
  const newTerm = termA.slice();
  newTerm[diffIndex] = ''; 
  return newTerm.filter(Boolean).join('∨') || '0';
}

export default function MinimizeCnfPractice() {
  const { t } = useTranslation(); // Хук перекладу
  const vars = ['A', 'B', 'C'];

  const [truthTable, setTruthTable] = useState([]);
  const [cnfTerms, setCnfTerms] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  function generateNewExample() {
    const table = generateTruthTable(vars);
    setTruthTable(table);
    const initialCNF = buildInitialCNF(table, vars);
    setCnfTerms(initialCNF);
    setSelectedTerms([]);
    setMessage('');
    setHistory([]);
  }

  useEffect(() => {
    generateNewExample();
  }, []);

  function toggleTermSelection(idx) {
    if (selectedTerms.includes(idx)) {
      setSelectedTerms(selectedTerms.filter(i => i !== idx));
      setMessage('');
    } else {
      if (selectedTerms.length >= 2) {
        setMessage(t('min_dnf_err_only_two')); // Використовуємо існуючий ключ
        return;
      }
      setSelectedTerms([...selectedTerms, idx]);
      setMessage('');
    }
  }

  function tryCombine() {
    if (selectedTerms.length !== 2) {
      setMessage(t('min_dnf_err_select_two'));
      return;
    }

    const [i, j] = selectedTerms;
    const termA = cnfTerms[i];
    const termB = cnfTerms[j];
    const diffIndex = canCombine(termA, termB);

    if (diffIndex === -1) {
      setMessage(t('min_dnf_err_cant_combine'));
      return;
    }

    const combinedTermStr = combineTerms(termA, termB);
    const combinedTermArr = combinedTermStr === '0' ? ['0'] : combinedTermStr.split('∨');

    if (cnfTerms.some((term, idx) => idx !== i && idx !== j && term.join('∨') === combinedTermStr)) {
      setMessage(t('min_dnf_err_exists', { term: combinedTermStr }));
      return;
    }

    const newTerms = cnfTerms.filter((_, idx) => idx !== i && idx !== j);
    newTerms.push(combinedTermArr);

    setCnfTerms(newTerms);
    setSelectedTerms([]);
    setMessage(t('min_dnf_success_combine', { first: i + 1, second: j + 1, res: combinedTermStr }));

    setHistory([
      ...history,
      t('min_cnf_hist_step', { first: i + 1, firstTerm: termA.join('∨'), second: j + 1, secondTerm: termB.join('∨'), res: combinedTermStr }),
    ]);
  }

  const canStillCombine = cnfTerms.some((termA, i) =>
    cnfTerms.some((termB, j) => i < j && canCombine(termA, termB) !== -1)
  );

  return (
    <div style={{ maxWidth: 720, margin: 'auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>🧩 {t('min_knf_title')} — {t('practice')}</h2>

      <div style={{ backgroundColor: '#e8f0fe', border: '1px solid #a6c8ff', padding: 15, borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
        <b>{t('min_dnf_instr_header')}:</b>
        <ol>
          <li>{t('min_cnf_step_1')}</li>
          <li>{t('min_dnf_step_2')}</li>
          <li>{t('min_dnf_step_3')}</li>
          <li>{t('min_dnf_step_4')}</li>
          <li>{t('min_dnf_step_5')}</li>
          <li>{t('min_dnf_step_6')}</li>
        </ol>
      </div>

      <h3>{t('truth_table_title')}:</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 20 }}>
        <thead>
          <tr>
            {vars.map(v => <th key={v} style={{ border: '1px solid #ccc', padding: 6 }}>{v}</th>)}
            <th style={{ border: '1px solid #ccc', padding: 6 }}>f</th>
          </tr>
        </thead>
        <tbody>
          {truthTable.map(({ inputs, value }, idx) => (
            <tr key={idx} style={{ backgroundColor: value === 0 ? '#f8d7da' : 'transparent' }}>
              {inputs.map((bit, i) => (
                <td key={i} style={{ border: '1px solid #ccc', padding: 6, textAlign: 'center' }}>{bit}</td>
              ))}
              <td style={{ border: '1px solid #ccc', padding: 6, textAlign: 'center' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{t('min_cnf_current_cnf')}:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cnfTerms.map((term, idx) => (
          <li key={idx} 
            style={{
              cursor: 'pointer',
              backgroundColor: selectedTerms.includes(idx) ? '#f5c6cb' : '#f8f9fa',
              padding: '8px 12px',
              borderRadius: 4,
              marginBottom: 5,
              border: '1px solid #ddd'
            }}
            onClick={() => toggleTermSelection(idx)}
          >
            <b>{idx + 1}.</b> {term.join('∨')}
          </li>
        ))}
      </ul>

      <button onClick={tryCombine} className="btn-primary" style={{ marginTop: 10 }}>
        {t('min_dnf_btn_combine')}
      </button>

      {message && <p style={{ marginTop: 10, backgroundColor: '#f8d7da', padding: 10, borderRadius: 6, borderLeft: '4px solid #dc3545' }}>{message}</p>}

      <h3>{t('min_dnf_hist_header')}:</h3>
      <ul style={{ fontSize: 14, color: '#555' }}>
        {history.map((msg, idx) => <li key={idx}>{msg}</li>)}
      </ul>

      {!canStillCombine && (
        <div style={{ marginTop: 20, backgroundColor: '#d1ecf1', padding: 15, borderRadius: 6, border: '1px solid #bee5eb' }}>
          <h3>🎉 {t('min_cnf_final_header')}:</h3>
          <p style={{ fontWeight: 'bold', fontSize: 18 }}>
            {cnfTerms.length > 0 ? cnfTerms.map(t => `(${t.join('∨')})`).join('∧') : '0'}
          </p>
          <button onClick={generateNewExample} className="btn-next" style={{ marginTop: 10 }}>
            {t('tp_next_btn')}
          </button>
        </div>
      )}
    </div>
  );
}