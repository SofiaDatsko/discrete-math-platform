import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Додано для локалізації
import './DnfPractice.css';

// Функція генерації вправи винесена за межі компонента, 
// але тепер вона повертає тільки дані, текст беремо з t()
function generateRandomExercise() {
  const varCount = Math.floor(Math.random() * 2) + 2; // 2-3 змінні для кращої візуалізації
  const vars = Array.from({ length: varCount }, (_, i) => String.fromCharCode(65 + i));
  const rowCount = 2 ** varCount;

  const values = Array(rowCount).fill(0);
  const oneCount = Math.floor(Math.random() * 3) + 1;
  while (values.filter((v) => v === 1).length < oneCount) {
    values[Math.floor(Math.random() * rowCount)] = 1;
  }

  const truthTable = Array(rowCount)
    .fill(null)
    .map((_, i) => ({
      inputs: vars.map((_, j) => (i >> (varCount - j - 1)) & 1),
      value: values[i],
    }));

  return { vars, truthTable };
}

export default function DnfPracticeInteractive() {
  const { t } = useTranslation(); // Ініціалізація перекладу
  const [exercise, setExercise] = useState(generateRandomExercise());
  const { vars, truthTable } = exercise;

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentTermParts, setCurrentTermParts] = useState({});
  const [feedback, setFeedback] = useState('');
  const [builtTerms, setBuiltTerms] = useState({});
  const [activeRowIdx, setActiveRowIdx] = useState(null);

  useEffect(() => {
    setSelectedRows(new Set());
    setCurrentTermParts({});
    setFeedback('');
    setBuiltTerms({});
    setActiveRowIdx(null);
  }, [exercise]);

  function toggleRow(idx) {
    setFeedback('');
    if (selectedRows.has(idx)) {
      const newSet = new Set(selectedRows);
      newSet.delete(idx);
      setSelectedRows(newSet);
      setBuiltTerms((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
      if (activeRowIdx === idx) setActiveRowIdx(null);
    } else {
      const newSet = new Set(selectedRows);
      newSet.add(idx);
      setSelectedRows(newSet);
      setActiveRowIdx(idx);
      const row = truthTable[idx];
      const initialParts = {};
      vars.forEach((v, i) => {
        initialParts[v] = row.inputs[i] === 1 ? v : `¬${v}`;
      });
      setCurrentTermParts(initialParts);
    }
  }

  function updateTermPart(varName, val) {
    setFeedback('');
    setCurrentTermParts((prev) => ({ ...prev, [varName]: val }));
  }

  const isCurrentTermComplete = vars.every((v) => currentTermParts[v] !== undefined && currentTermParts[v] !== '');

  function confirmTerm() {
    if (activeRowIdx === null) return;
    if (!isCurrentTermComplete) {
      setFeedback(t('dnf_practice_error_incomplete'));
      return;
    }

    const row = truthTable[activeRowIdx];
    let correct = true;
    for (let i = 0; i < vars.length; i++) {
      const v = vars[i];
      if (
        (row.inputs[i] === 1 && currentTermParts[v] !== v) ||
        (row.inputs[i] === 0 && currentTermParts[v] !== `¬${v}`)
      ) {
        correct = false;
        break;
      }
    }
    if (!correct) {
      setFeedback(t('dnf_practice_error_wrong_term'));
      return;
    }
    setFeedback(t('dnf_practice_success_term'));
    setBuiltTerms((prev) => ({ ...prev, [activeRowIdx]: { ...currentTermParts } }));
    setActiveRowIdx(null);
  }

  function buildExpression() {
    if (Object.keys(builtTerms).length === 0) return `(${t('dnf_practice_no_minterms')})`;
    const terms = [];
    Array.from(selectedRows).forEach((idx) => {
      if (builtTerms[idx]) {
        const term = vars.map((v) => builtTerms[idx][v]).join(' ∧ ');
        terms.push(`(${term})`);
      }
    });
    return terms.length > 0 ? terms.join(' ∨ ') : `(${t('dnf_practice_no_minterms')})`;
  }

  const correctRows = truthTable.reduce((acc, row, i) => {
    if (row.value === 1) acc.push(i);
    return acc;
  }, []);

  function isAnswerCorrect() {
    if (selectedRows.size !== correctRows.length) return false;
    for (const idx of correctRows) {
      if (!selectedRows.has(idx)) return false;
      if (!builtTerms[idx]) return false;
    }
    return true;
  }

  const handleCheckOverall = () => {
    if (isAnswerCorrect()) {
      alert(t('dnf_practice_alert_correct'));
    } else {
      alert(t('dnf_practice_alert_wrong'));
    }
  };

  return (
    <div className="dnf-practice-container" style={{ maxWidth: 900, margin: 'auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>🧩 {t('ddnf_title')} — {t('practice')}</h2>
      <p>{t('dnf_practice_desc')}</p>
      <p>{t('dnf_practice_instr')}</p>

      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 450 }}>
          <thead>
            <tr>
              {vars.map((v) => (
                <th key={v} style={{ border: '1px solid #ccc', padding: 6 }}>{v}</th>
              ))}
              <th style={{ border: '1px solid #ccc', padding: 6 }}>{t('logic_function')}</th>
              <th style={{ border: '1px solid #ccc', padding: 6 }}>{t('dnf_practice_select')}</th>
            </tr>
          </thead>
          <tbody>
            {truthTable.map((row, idx) => {
              const isSelected = selectedRows.has(idx);
              const isCorrectRow = correctRows.includes(idx);
              const isTermBuilt = !!builtTerms[idx];
              return (
                <tr
                  key={idx}
                  onClick={() => toggleRow(idx)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? isCorrectRow && isTermBuilt ? '#a5d6a7' : '#f8d7da'
                      : isCorrectRow ? '#e8f5e9' : 'white',
                    userSelect: 'none',
                  }}
                >
                  {row.inputs.map((val, i) => (
                    <td key={i} style={{ border: '1px solid #ccc', padding: 6 }}>{val}</td>
                  ))}
                  <td style={{ border: '1px solid #ccc', padding: 6 }}>{row.value}</td>
                  <td style={{ border: '1px solid #ccc', padding: 6 }}>
                    <input type="checkbox" checked={isSelected} readOnly />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {activeRowIdx !== null && (
          <div className="active-term-editor" style={{ border: '1px solid #ccc', borderRadius: 6, padding: 15, maxWidth: 350, flexGrow: 1 }}>
            <h3>{t('dnf_practice_build_header')} #{activeRowIdx + 1}</h3>
            <p>{t('dnf_practice_input_vals')}: {vars.map((v, i) => `${v}=${truthTable[activeRowIdx].inputs[i]}`).join(', ')}</p>
            <table>
              <thead>
                <tr>
                  <th>{t('logic_variable')}</th>
                  <th>{t('dnf_practice_choice')}</th>
                </tr>
              </thead>
              <tbody>
                {vars.map((v) => (
                  <tr key={v}>
                    <td>{v}</td>
                    <td>
                      <select
                        value={currentTermParts[v] || ''}
                        onChange={(e) => updateTermPart(v, e.target.value)}
                      >
                        <option value="" disabled>{t('tp_choose_option')}</option>
                        <option value={v}>{v}</option>
                        <option value={`¬${v}`}>¬{v}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={confirmTerm}
              style={{ marginTop: 10 }}
              disabled={!isCurrentTermComplete}
            >
              {t('dnf_practice_confirm_btn')}
            </button>
            <p style={{ 
              color: feedback === t('dnf_practice_success_term') ? 'green' : 'red', 
              fontWeight: 'bold' 
            }}>
              {feedback}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>{t('dnf_practice_expr_header')}:</h3>
        <code style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 6, display: 'block', whiteSpace: 'pre-wrap' }}>
          {buildExpression()}
        </code>
        <button onClick={handleCheckOverall} style={{ marginTop: 10 }}>
          {t('tp_check_btn')}
        </button>
      </div>

      <button style={{ marginTop: 20 }} onClick={() => setExercise(generateRandomExercise())}>
        {t('tp_next_btn')}
      </button>
    </div>
  );
}