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

function computeZhegalkinSteps(values) {
  const n = values.length;
  const steps = [values.slice()];
  for (let i = 1; i < n; i++) {
    const prev = steps[steps.length - 1].slice();
    for (let j = n - 1; j >= i; j--) {
      prev[j] = prev[j] ^ prev[j - 1];
    }
    steps.push(prev);
  }
  return steps;
}

function generateMonomials(vars) {
  const n = vars.length;
  const monomials = [];
  const total = 2 ** n;
  for (let i = 0; i < total; i++) {
    const includedVars = [];
    for (let j = 0; j < n; j++) {
      if ((i >> j) & 1) {
        includedVars.push(vars[j]);
      }
    }
    monomials.push(includedVars.length === 0 ? '1' : includedVars.join('∧'));
  }
  return monomials;
}

export default function ZhegalkinPractice() {
  const { t } = useTranslation(); // Хук перекладу
  const [vars] = useState(['A', 'B', 'C']);
  const [truthTable, setTruthTable] = useState([]);
  const [userCoefficients, setUserCoefficients] = useState({});
  const [steps, setSteps] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    generateNewExercise();
  }, []);

  function generateNewExercise() {
    const table = generateTruthTable(vars);
    setTruthTable(table);
    const values = table.map((row) => row.value);
    const computedSteps = computeZhegalkinSteps(values);
    setSteps(computedSteps);
    setUserCoefficients({});
    setSubmitted(false);
    setFeedback('');
    setStepIndex(0);
  }

  const monomials = generateMonomials(vars);
  const correctCoefficients = steps.length > 0 ? steps[steps.length - 1] : [];

  function handleChange(idx, val) {
    if (val !== '0' && val !== '1') return;
    setUserCoefficients((prev) => ({ ...prev, [idx]: val }));
  }

  function handleSubmit() {
    for (let i = 0; i < monomials.length; i++) {
      if (!(i in userCoefficients)) {
        setFeedback(t('zheg_err_fill_all'));
        return;
      }
    }
    let allCorrect = true;
    for (let i = 0; i < monomials.length; i++) {
      if (parseInt(userCoefficients[i]) !== correctCoefficients[i]) {
        allCorrect = false;
        break;
      }
    }
    setSubmitted(true);
    setFeedback(allCorrect ? t('zheg_res_perfect') : t('zheg_res_error'));
  }

  function handleNext() {
    generateNewExercise();
  }

  const getStepExplanation = (idx, allSteps) => {
    if (idx === 0) return t('zheg_expl_initial');
    const prevRow = allSteps[idx - 1];
    const currRow = allSteps[idx];
    const n = currRow.length;
    const explanations = [];
    for (let i = idx; i < n; i++) {
      explanations.push(`Index ${i}: ${prevRow[i - 1]} XOR ${prevRow[i]} = ${currRow[i]}`);
    }
    return (
      <>
        <p>{t('zheg_expl_step_desc', { stepIndex: idx })}:</p>
        <ul>
          {explanations.map((line, k) => (
            <li key={k} style={{ fontFamily: 'monospace' }}>{line}</li>
          ))}
        </ul>
        <p>{t('zheg_expl_step_unchanged', { stepIndex: idx })}</p>
      </>
    );
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        🧩 {t('zhegalkin_title')} — {t('practice')}
        <button onClick={() => setShowTip(!showTip)} className="tip-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
          💡
        </button>
      </h2>

      {showTip && (
        <section style={{ backgroundColor: '#f9f9d1', padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          <h3>{t('zheg_tip_header')}</h3>
          <p>{t('zhegalkin_desc')}</p>
          <p>{t('zheg_tip_vars_label')}: A, B, C</p>
          <h4>{t('zheg_tip_calc_header')}</h4>
          <p>{t('zheg_tip_calc_desc')}</p>
        </section>
      )}

      <h3>{t('truth_table_title')} (f):</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 15 }}>
        <thead>
          <tr>
            {vars.map((v) => <th key={v} style={{ border: '1px solid #ccc', padding: 6 }}>{v}</th>)}
            <th style={{ border: '1px solid #ccc', padding: 6 }}>f</th>
          </tr>
        </thead>
        <tbody>
          {truthTable.map(({ inputs, value }, i) => (
            <tr key={i}>
              {inputs.map((bit, idx) => <td key={idx} style={{ border: '1px solid #ccc', padding: 6 }}>{bit}</td>)}
              <td style={{ border: '1px solid #ccc', padding: 6 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{t('zheg_step_label')} {stepIndex + 1} {t('tp_and')} {steps.length} — {t('zheg_triang_method')}:</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 15 }}>
        <tbody>
          <tr>
            {steps[stepIndex]?.map((val, i) => (
              <td key={i} style={{ border: '1px solid #ccc', padding: 6, backgroundColor: i >= stepIndex ? '#d4edda' : '#f0f0f0', fontWeight: 'bold', textAlign: 'center' }}>
                {val}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div style={{ backgroundColor: '#eef6f9', padding: 12, borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
        {getStepExplanation(stepIndex, steps)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => setStepIndex(i => Math.max(0, i - 1))} disabled={stepIndex === 0}>{t('zheg_prev_step')}</button>
        <button onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))} disabled={stepIndex === steps.length - 1}>{t('zheg_next_step')}</button>
      </div>

      <h3>{t('zheg_coeffs_header')}:</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 15 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 6 }}>{t('zheg_monomial')}</th>
            <th style={{ border: '1px solid #ccc', padding: 6 }}>{t('zheg_coefficient')}</th>
            {submitted && <th style={{ border: '1px solid #ccc', padding: 6 }}>{t('zheg_is_correct')}</th>}
          </tr>
        </thead>
        <tbody>
          {monomials.map((monom, i) => {
            const userVal = userCoefficients[i] ?? '';
            const isCorrect = submitted && parseInt(userVal) === correctCoefficients[i];
            return (
              <tr key={i} style={{ backgroundColor: isCorrect ? '#d4edda' : submitted ? '#f8d7da' : 'transparent' }}>
                <td style={{ border: '1px solid #ccc', padding: 6 }}>{monom}</td>
                <td style={{ border: '1px solid #ccc', padding: 6 }}>
                  <select value={userVal} disabled={submitted} onChange={(e) => handleChange(i, e.target.value)}>
                    <option value="">-</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </select>
                </td>
                {submitted && <td style={{ border: '1px solid #ccc', padding: 6, textAlign: 'center' }}>{isCorrect ? '✔️' : '❌'}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={submitted ? handleNext : handleSubmit}>
        {submitted ? t('tp_next_btn') : t('tp_check_btn')}
      </button>

      {feedback && <p style={{ marginTop: 10, fontWeight: 'bold', color: feedback.includes('Відмінно') || feedback.includes('Excellent') ? 'green' : 'red' }}>{feedback}</p>}
    </div>
  );
}