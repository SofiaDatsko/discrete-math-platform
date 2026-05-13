import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Додано для перекладу
import './TruthTablePractice.css';

// Масив виразів із різною кількістю змінних і складністю
const expressions = [
    { expr: 'A && B', vars: ['A', 'B'], text: '(A ∧ B)' },
    { expr: 'A || B', vars: ['A', 'B'], text: '(A ∨ B)' },
    { expr: '!A || B', vars: ['A', 'B'], text: '(¬A ∨ B)' },
    { expr: 'A ^ B', vars: ['A', 'B'], text: '(A ⊕ B)' },
    { expr: '(A && !B) || C', vars: ['A', 'B', 'C'], text: '((A ∧ ¬B) ∨ C)' },
    { expr: '(!A && B) || (C ^ A)', vars: ['A', 'B', 'C'], text: '((¬A ∧ B) ∨ (C ⊕ A))' },
    { expr: 'A || (B && !C)', vars: ['A', 'B', 'C'], text: '(A ∨ (B ∧ ¬C))' },
    { expr: '(A ^ B) && (C || !A)', vars: ['A', 'B', 'C'], text: '((A ⊕ B) ∧ (C ∨ ¬A))' },
];

// Функція для генерації всіх комбінацій змінних
function generateCombinations(vars) {
    const rows = Math.pow(2, vars.length);
    return Array.from({ length: rows }, (_, i) =>
        vars.map((_, j) => (i >> (vars.length - j - 1)) & 1)
    );
}

// Обчислення результату виразу для конкретної комбінації
function computeResult(expr, vars, values) {
    try {
        const fn = new Function(...vars, `return ${expr};`);
        return fn(...values) ? '1' : '0';
    } catch {
        return '-';
    }
}

export default function TruthTablePractice() {
    const { t } = useTranslation(); // Хук перекладу
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [showRules, setShowRules] = useState(false); // стан для правила

    const { expr, vars, text } = expressions[currentIndex];
    const combinations = generateCombinations(vars);

    useEffect(() => {
        setAnswers({});
        setSubmitted(false);
    }, [currentIndex]);

    const handleChange = (index, value) => {
        setAnswers({ ...answers, [index]: value });
    };

    const checkAnswer = (row) => computeResult(expr, vars, row);

    const getExplanation = (index, row) => {
        const correct = checkAnswer(row);
        const userAns = answers[index];
        if (userAns === '') return t('tp_choose_option');
        if (userAns === correct) return t('tp_correct');
        else {
            return `${t('tp_incorrect')}. ${t('tp_for_combo')} ${vars
                .map((v, i) => `${v}=${row[i]}`)
                .join(', ')} ${t('tp_correct_is')}: ${correct}`;
        }
    };

    const isCorrect = (index, row) => answers[index] === checkAnswer(row);

    const handleNext = () => {
        setCurrentIndex((currentIndex + 1) % expressions.length);
        setShowRules(false);
    };

    return (
        <div className="truth-table-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <h2 style={{ margin: 0 }}>🧠 {t('truth_table_title')}</h2>
                <button
                    onClick={() => setShowRules(!showRules)}
                    aria-label={t('tp_toggle_rules')}
                    style={{
                        fontSize: '1.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                    title={t('tp_rules_title')}
                >
                    💡
                </button>
            </div>

            {showRules && (
                <div className="rules-box" style={{ backgroundColor: '#f9f9d1', padding: 15, borderRadius: 6, marginBottom: 15 }}>
                    <h3>{t('tp_rules_header')}:</h3>
                    <ul>
                        <li><b>∧ (AND)</b> — {t('tp_rule_and')}.<br />
                            {t('tp_example')}: <code>A=1, B=1 ⇒ A ∧ B = 1</code>, <code>A=1, B=0 ⇒ A ∧ B = 0</code>
                        </li>
                        <li><b>∨ (OR)</b> — {t('tp_rule_or')}.<br />
                            {t('tp_example')}: <code>A=0, B=1 ⇒ A ∨ B = 1</code>, <code>A=0, B=0 ⇒ A ∨ B = 0</code>
                        </li>
                        <li><b>¬ (NOT)</b> — {t('tp_rule_not')}.<br />
                            {t('tp_example')}: <code>A=0 ⇒ ¬A = 1</code>, <code>A=1 ⇒ ¬A = 0</code>
                        </li>
                        <li><b>⊕ (XOR)</b> — {t('tp_rule_xor')}.<br />
                            {t('tp_example')}: <code>A=1, B=0 ⇒ A ⊕ B = 1</code>, <code>A=1, B=1 ⇒ A ⊕ B = 0</code>
                        </li>
                    </ul>
                    <p>{t('tp_how_to_fill')}</p>
                    <p>{t('tp_example_desc')}: <code>(¬A ∨ B)</code>:</p>
                    <ul>
                        <li>{t('tp_step_1')} <code>¬A</code>.</li>
                        <li>{t('tp_step_2')} OR (<code>∨</code>) {t('tp_between')} <code>¬A</code> {t('tp_and')} B.</li>
                        <li>{t('tp_step_3')}.</li>
                    </ul>
                    <p>{t('tp_hint')}</p>
                </div>
            )}

            <p>
                {t('tp_fill_table')}:
                <br />
                <code>{text}</code>
            </p>

            <table className="truth-table">
                <thead>
                    <tr>
                        {vars.map((v) => (
                            <th key={v}>{v}</th>
                        ))}
                        <th>{t('tp_result_col')}</th>
                        <th>{t('tp_explanation_col')}</th>
                    </tr>
                </thead>
                <tbody>
                    {combinations.map((row, index) => {
                        const userAns = answers[index] || '';
                        return (
                            <tr key={index}>
                                {row.map((val, i) => (
                                    <td key={i}>{val}</td>
                                ))}
                                <td>
                                    {submitted ? (
                                        <span className={isCorrect(index, row) ? 'correct' : 'incorrect'}>
                                            {userAns || '-'}
                                        </span>
                                    ) : (
                                        <select value={userAns} onChange={(e) => handleChange(index, e.target.value)}>
                                            <option value="">-</option>
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                        </select>
                                    )}
                                </td>
                                <td className={submitted ? (isCorrect(index, row) ? 'correct' : 'incorrect') : ''}>
                                    {submitted ? getExplanation(index, row) : ''}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {!submitted ? (
                <button className="submit-btn" onClick={() => setSubmitted(true)}>
                    {t('tp_check_btn')}
                </button>
            ) : (
                <button className="submit-btn" onClick={handleNext}>
                    {t('tp_next_btn')}
                </button>
            )}
        </div>
    );
}