import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Додано для перекладу
import './VennPractice.css';

// ... (EXPRESSION_TEMPLATES, ALL_NUMBERS, та математичні функції без змін)
const EXPRESSION_TEMPLATES = {
    2: [
      { text: 'A ∪ B', id: 'A_union_B' },
      { text: 'A ∩ B', id: 'A_intersect_B' },
      { text: 'A \\ B', id: 'A_diff_B' },
      { text: 'B \\ A', id: 'B_diff_A' },
      { text: 'A △ B', id: 'A_symdiff_B' },
    ],
    3: [
      { text: 'A ∪ B ∪ C', id: 'A_union_B_union_C' },
      { text: 'A ∩ B ∩ C', id: 'A_intersect_B_intersect_C' },
      { text: '(A ∪ B) ∩ C', id: 'A_union_B_intersect_C' },
      { text: 'A ∪ (B ∩ C)', id: 'A_union_B_intersect_C_rev' },
      { text: '(A ∩ B) ∪ C', id: 'A_intersect_B_union_C' },
      { text: 'A ∩ (B ∪ C)', id: 'A_intersect_B_union_C_rev' },
      { text: 'A \\ (B ∪ C)', id: 'A_diff_B_union_C' },
      { text: '(A ∪ B) \\ C', id: 'A_union_B_diff_C' },
      { text: '(A △ B) ∩ C', id: 'A_symdiff_B_intersect_C'},
    ],
  };

  const ALL_NUMBERS = Array.from({ length: 25 }, (_, i) => i + 1);

  const union = (a, b) => Array.from(new Set([...a, ...b]));
  const intersection = (a, b) => a.filter(x => b.includes(x));
  const difference = (a, b) => a.filter(x => !b.includes(x));
  const symmetricDifference = (a, b) => union(difference(a,b), difference(b,a));

const VennDiagram = ({ count }) => (
  <svg viewBox="0 0 400 380" className="venn-diagram-visual">
    <g className="venn-circles">
      <circle cx="160" cy="170" r="100" className="circle-a" />
      <circle cx="240" cy="170" r="100" className="circle-b" />
      {count === 3 && <circle cx="200" cy="250" r="100" className="circle-c" />}
    </g>
    <g className="venn-labels">
      <text x="90" y="120">A</text>
      <text x="310" y="120">B</text>
      {count === 3 && <text x="200" y="360">C</text>}
    </g>
  </svg>
);

export function VennPractice() {
  const { t } = useTranslation(); // Ініціалізуємо переклад
  const [sets, setSets] = useState({ A: [], B: [], C: [] });
  const [currentExpression, setCurrentExpression] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState([]);
  const [numberPool, setNumberPool] = useState([]);
  const [userSelection, setUserSelection] = useState([]);
  const [feedback, setFeedback] = useState({ status: '', message: '', explanation: null });

  const calculateExpression = useCallback((expressionId, currentSets) => {
    const { A, B, C } = currentSets;
    switch (expressionId) {
        case 'A_union_B': return union(A, B);
        case 'A_intersect_B': return intersection(A, B);
        case 'A_diff_B': return difference(A, B);
        case 'B_diff_A': return difference(B, A);
        case 'A_symdiff_B': return symmetricDifference(A, B);
        case 'A_union_B_union_C': return union(union(A, B), C);
        case 'A_intersect_B_intersect_C': return intersection(intersection(A, B), C);
        case 'A_union_B_intersect_C': return intersection(union(A, B), C);
        case 'A_union_B_intersect_C_rev': return union(A, intersection(B, C));
        case 'A_intersect_B_union_C': return union(intersection(A, B), C);
        case 'A_intersect_B_union_C_rev': return intersection(A, union(B, C));
        case 'A_diff_B_union_C': return difference(A, union(B, C));
        case 'A_union_B_diff_C': return difference(union(A, B), C);
        case 'A_symdiff_B_intersect_C': return intersection(symmetricDifference(A,B), C);
        default: return [];
      }
  }, []);

  const generateExplanation = useCallback(() => {
    const { id } = currentExpression;
    const { A, B, C } = sets;
    let steps = [];

    const formatSet = (s) => `{ ${s.sort((a,b)=>a-b).join(', ')} }`;

    switch (id) {
      case 'A_union_B':
        steps.push(t('venn_expl_union'));
        steps.push(`A ∪ B = ${formatSet(A)} ∪ ${formatSet(B)}`);
        break;
      
      case 'A_intersect_B':
        steps.push(t('venn_expl_intersect'));
        steps.push(`A ∩ B = ${formatSet(A)} ∩ ${formatSet(B)}`);
        break;

      case 'A_diff_B':
        steps.push(t('venn_expl_diff_ab'));
        steps.push(`A \\ B = ${formatSet(A)} \\ ${formatSet(B)}`);
        break;

      case 'B_diff_A':
        steps.push(t('venn_expl_diff_ba'));
        steps.push(`B \\ A = ${formatSet(B)} \\ ${formatSet(A)}`);
        break;

      case 'A_symdiff_B':
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_diff_ab')}`);
        steps.push(`A \\ B = ${formatSet(difference(A, B))}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_diff_ba')}`);
        steps.push(`B \\ A = ${formatSet(difference(B, A))}`);
        steps.push(`${t('venn_step')} 3: ${t('venn_expl_union_res')}`);
        break;

      case 'A_union_B_union_C':
        const unionAB_C = union(A, B);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_union_ab')}`);
        steps.push(`A ∪ B = ${formatSet(unionAB_C)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_union_res_c')}`);
        steps.push(`(A ∪ B) ∪ C = ${formatSet(unionAB_C)} ∪ ${formatSet(C)}`);
        break;

      case 'A_intersect_B_intersect_C':
        const intersectAB_C = intersection(A, B);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_intersect_ab')}`);
        steps.push(`A ∩ B = ${formatSet(intersectAB_C)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_intersect_res_c')}`);
        steps.push(`(A ∩ B) ∩ C = ${formatSet(intersectAB_C)} ∩ ${formatSet(C)}`);
        break;

      case 'A_union_B_intersect_C':
        const unionAB = union(A, B);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_union_ab')}`);
        steps.push(`A ∪ B = ${formatSet(unionAB)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_intersect_res_c')}`);
        steps.push(`(A ∪ B) ∩ C = ${formatSet(unionAB)} ∩ ${formatSet(C)}`);
        break;
      
      case 'A_union_B_intersect_C_rev':
        const intersectBC = intersection(B,C);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_intersect_bc')}`);
        steps.push(`B ∩ C = ${formatSet(intersectBC)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_union_a_res')}`);
        steps.push(`A ∪ (B ∩ C) = ${formatSet(A)} ∪ ${formatSet(intersectBC)}`);
        break;

      case 'A_intersect_B_union_C':
        const intersectAB = intersection(A, B);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_intersect_ab')}`);
        steps.push(`A ∩ B = ${formatSet(intersectAB)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_union_res_c')}`);
        steps.push(`(A ∩ B) ∪ C = ${formatSet(intersectAB)} ∪ ${formatSet(C)}`);
        break;
      
      case 'A_intersect_B_union_C_rev':
        const unionBC = union(B, C);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_union_bc')}`);
        steps.push(`B ∪ C = ${formatSet(unionBC)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_intersect_a_res')}`);
        steps.push(`A ∩ (B ∪ C) = ${formatSet(A)} ∩ ${formatSet(unionBC)}`);
        break;
      
      case 'A_diff_B_union_C':
        const unionBC_diff = union(B, C);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_union_bc')}`);
        steps.push(`B ∪ C = ${formatSet(unionBC_diff)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_diff_a_res')}`);
        steps.push(`A \\ (B ∪ C) = ${formatSet(A)} \\ ${formatSet(unionBC_diff)}`);
        break;

      case 'A_union_B_diff_C':
        const unionAB_diff = union(A, B);
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_union_ab')}`);
        steps.push(`A ∪ B = ${formatSet(unionAB_diff)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_diff_res_c')}`);
        steps.push(`(A ∪ B) \\ C = ${formatSet(unionAB_diff)} \\ ${formatSet(C)}`);
        break;
        
      case 'A_symdiff_B_intersect_C':
        steps.push(`${t('venn_step')} 1: ${t('venn_expl_paren_symdiff_ab')}`);
        const diffAB_sym = difference(A, B);
        const diffBA_sym = difference(B, A);
        const symDiffAB = symmetricDifference(A, B);
        steps.push(`A \\ B = ${formatSet(diffAB_sym)}`);
        steps.push(`B \\ A = ${formatSet(diffBA_sym)}`);
        steps.push(`A △ B = ${formatSet(symDiffAB)}`);
        steps.push(`${t('venn_step')} 2: ${t('venn_expl_intersect_res_c')}`);
        steps.push(`(A △ B) ∩ C = ${formatSet(symDiffAB)} ∩ ${formatSet(C)}`);
        break;
      default: break;
    }
    
    steps.push(`<strong>${t('venn_final_res')}: ${formatSet(correctAnswer)}</strong>`);
    return steps;
  }, [currentExpression, sets, correctAnswer, t]);

  const generateNewProblem = useCallback(() => {
    const variablesCount = Math.random() < 0.5 ? 2 : 3;
    const shuffled = shuffle(ALL_NUMBERS);

    const newSets = {
      A: shuffled.slice(0, 10).sort((a, b) => a - b),
      B: shuffled.slice(6, 16).sort((a, b) => a - b),
      C: variablesCount === 3 ? shuffled.slice(12, 22).sort((a, b) => a - b) : [],
    };
    
    const templates = EXPRESSION_TEMPLATES[variablesCount];
    const expression = templates[Math.floor(Math.random() * templates.length)];
    const result = calculateExpression(expression.id, newSets);
    
    setSets(newSets);
    setCurrentExpression({ ...expression, count: variablesCount });
    setCorrectAnswer(result.sort((a, b) => a - b));

    const allUnique = Array.from(new Set([...newSets.A, ...newSets.B, ...newSets.C]));
    setNumberPool(shuffle(allUnique));
    setUserSelection([]);
    setFeedback({ status: '', message: '', explanation: null });
  }, [calculateExpression]);

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  const handleDragStart = (e, number) => {
    e.dataTransfer.setData('text/plain', number);
  };
  
  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    const number = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (targetZone === 'selection' && !userSelection.includes(number)) {
      setUserSelection(prev => [...prev, number].sort((a, b) => a - b));
      setNumberPool(prev => prev.filter(n => n !== number));
    } else if (targetZone === 'pool' && !numberPool.includes(number)) {
      setNumberPool(prev => [...prev, number].sort((a, b) => a - b));
      setUserSelection(prev => prev.filter(n => n !== number));
    }
  };

  const checkAnswer = () => {
    const sortedUser = [...userSelection].sort((a, b) => a - b);
    if (JSON.stringify(sortedUser) === JSON.stringify(correctAnswer)) {
      setFeedback({ 
        status: 'success', 
        message: t('venn_correct_msg'),
        explanation: null 
      });
    } else {
      const explanationSteps = generateExplanation();
      setFeedback({ 
        status: 'error', 
        message: t('venn_error_msg'),
        explanation: explanationSteps
      });
    }
  };
  
  if (!currentExpression) return <div className="practice-container">{t('loading_trainer')}</div>;

  return (
    <div className="practice-container venn-trainer">
      <h2>🧩 {t('venn_trainer_title')}</h2>

      <div className="problem-area">
        <div className="sets-display-column">
          <p><b>A</b> = {'{ ' + sets.A.join(', ') + ' }'}</p>
          <p><b>B</b> = {'{ ' + sets.B.join(', ') + ' }'}</p>
          {currentExpression.count === 3 && <p><b>C</b> = {'{ ' + sets.C.join(', ') + ' }'}</p>}
        </div>
        <div className="diagram-container">
          <VennDiagram count={currentExpression.count} />
        </div>
      </div>
      
      <div className="task-container">
        <p className="instruction">{t('venn_solve_expr')}:</p>
        <div className="operation-display">{currentExpression.text}</div>
      </div>
      
      <h4>👇 {t('venn_drag_instruction')}</h4>
      <div
        className="selection-zone"
        onDragOver={e => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'selection')}
      >
        {userSelection.length > 0
          ? userSelection.map(num => <div key={num} draggable onDragStart={e => handleDragStart(e, num)} className="draggable-number selected">{num}</div>)
          : <span className="zone-placeholder">{t('venn_zone_placeholder')}</span>
        }
      </div>

      <h4>🔢 {t('venn_pool_title')}</h4>
      <div
        className="number-pool"
        onDragOver={e => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'pool')}
      >
        {numberPool.map(num => <div key={num} draggable onDragStart={e => handleDragStart(e, num)} className="draggable-number">{num}</div>)}
      </div>
      
      <div className="controls">
        <button onClick={checkAnswer}>{t('check_btn')}</button>
        <button onClick={generateNewProblem} className="secondary">{t('next_task_btn')}</button>
      </div>

      {feedback.message && (
        <div className={`feedback-container ${feedback.status}`}>
            <p className="feedback-message">{feedback.message}</p>
            {feedback.explanation && (
                <div className="explanation-box">
                    <h4>{t('step_by_step_analysis')}:</h4>
                    {feedback.explanation.map((step, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: step }} />
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}