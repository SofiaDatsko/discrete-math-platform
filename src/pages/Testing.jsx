import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Testing.css';

// Конфігурація Groq
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY; 
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const STATIC_TESTS = {
  graphs: [
    { question: 'q_dfs', options: ['q_dfs_o1', 'q_dfs_o2', 'q_dfs_o3', 'q_dfs_o4'], answer: 1, explanation: 'q_dfs_exp' },
    { question: 'q_dijkstra', options: ['q_dijkstra_o1', 'q_dijkstra_o2', 'q_dijkstra_o3', 'q_dijkstra_o4'], answer: 0, explanation: 'q_dijkstra_exp' },
    { question: 'q_kruskal', options: ['q_kruskal_o1', 'q_kruskal_o2', 'q_kruskal_o3', 'q_kruskal_o4'], answer: 2, explanation: 'q_kruskal_exp' },
    { question: 'q_oriented', options: ['q_oriented_o1', 'q_oriented_o2', 'q_oriented_o3', 'q_oriented_o4'], answer: 1, explanation: 'q_oriented_exp' },
    { question: 'q_bfs', options: ['q_bfs_o1', 'q_bfs_o2', 'q_bfs_o3', 'q_bfs_o4'], answer: 1, explanation: 'q_bfs_exp' },
    { question: 'q_cycle', options: ['q_cycle_o1', 'q_cycle_o2', 'q_cycle_o3', 'q_cycle_o4'], answer: 1, explanation: 'q_cycle_exp' },
    { question: 'q_stack', options: ['q_stack_o1', 'q_stack_o2', 'q_stack_o3', 'q_stack_o4'], answer: 0, explanation: 'q_stack_exp' },
  ],
  logic: [
    { question: 'q_conj', options: ['q_conj_o1', 'q_conj_o2', 'q_conj_o3', 'q_conj_o4'], answer: 1, explanation: 'q_conj_exp' },
    { question: 'q_table', options: ['q_table_o1', 'q_table_o2', 'q_table_o3', 'q_table_o4'], answer: 1, explanation: 'q_table_exp' },
    { question: 'q_disj', options: ['q_disj_o1', 'q_disj_o2', 'q_disj_o3', 'q_disj_o4'], answer: 0, explanation: 'q_disj_exp' },
    { question: 'q_morgan', options: ['q_morgan_o1', 'q_morgan_o2', 'q_morgan_o3', 'q_morgan_o4'], answer: 0, explanation: 'q_morgan_exp' },
    { question: 'q_tautology', options: ['q_tautology_o1', 'q_tautology_o2', 'q_tautology_o3', 'q_tautology_o4'], answer: 2, explanation: 'q_tautology_exp' },
    { question: 'q_xor', options: ['q_xor_o1', 'q_xor_o2', 'q_xor_o3', 'q_xor_o4'], answer: 2, explanation: 'q_xor_exp' },
  ],
  combinatorics: [
    { question: 'q_perm', options: ['q_perm_o1', 'q_perm_o2', 'q_perm_o3', 'q_perm_o4'], answer: 2, explanation: 'q_perm_exp' },
    { question: 'q_comb_formula', options: ['q_comb_formula_o1', 'q_comb_formula_o2', 'q_comb_formula_o3', 'q_comb_formula_o4'], answer: 0, explanation: 'q_comb_formula_exp' },
    { question: 'q_books', options: ['q_books_o1', 'q_books_o2', 'q_books_o3', 'q_books_o4'], answer: 2, explanation: 'q_books_exp' },
    { question: 'q_arr_formula', options: ['q_arr_formula_o1', 'q_arr_formula_o2', 'q_arr_formula_o3', 'q_arr_formula_o4'], answer: 1, explanation: 'q_arr_formula_exp' },
    { question: 'q_people', options: ['q_people_o1', 'q_people_o2', 'q_people_o3', 'q_people_o4'], answer: 3, explanation: 'q_people_exp' },
    { question: 'q_sum_rule', options: ['q_sum_rule_o1', 'q_sum_rule_o2', 'q_sum_rule_o3', 'q_sum_rule_o4'], answer: 0, explanation: 'q_sum_rule_exp' },
  ],
};

const QUESTIONS_PER_QUIZ = 5;

export default function Testing() {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState('graphs');
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);

  // Універсальна функція для виклику Groq API
  const callGroq = async (systemPrompt, userPrompt, useJson = false) => {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: useJson ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Groq Error");
    }
    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Отримання пояснення
  const getAiExplanation = async (question, userAnswer, correctAnswer) => {
    setAiLoading(true);
    setAiExplanation("");
    const lang = i18n.language === 'ua' ? 'українську' : 'англійську';
    
    const systemPrompt = "Ти професійний викладач дискретної математики. Пояснюй стисло.";
    const userPrompt = `Тема: "${t(topic)}". Питання: "${isAiMode ? question : t(question)}". 
    Студент обрав: "${isAiMode ? userAnswer : t(userAnswer)}". 
    Правильна відповідь: "${isAiMode ? correctAnswer : t(correctAnswer)}". 
    Поясни коротко і зрозуміло, чому саме ця відповідь правильна на ${lang} мові.`;

    try {
      const content = await callGroq(systemPrompt, userPrompt);
      setAiExplanation(content);
    } catch (error) {
      console.error(error);
      setAiExplanation(t('ai_error_msg') || "Помилка отримання пояснення.");
    } finally {
      setAiLoading(false);
    }
  };

  // Генерація тесту
  const generateAiQuiz = async (topicKey) => {
    setAiLoading(true);
    setIsAiMode(true);
    setAiExplanation("");
    
    const lang = i18n.language === 'ua' ? 'Ukrainian' : 'English';
    const systemPrompt = "You are a discrete math test generator. You must return ONLY a JSON object with a key 'questions' containing an array of 5 questions.";
    const userPrompt = `Generate 5 unique discrete mathematics questions about ${t(topicKey)}. 
    Language: ${lang}.
    JSON Format: {"questions": [{"question": "text", "options": ["opt1", "opt2", "opt3", "opt4"], "answer": 0, "explanation": "text"}]}`;

    try {
      const content = await callGroq(systemPrompt, userPrompt, true);
      const data = JSON.parse(content);
      setActiveQuestions(data.questions);
      setCurrentQ(0); setScore(0); setSelected(null); setShowResult(false);
    } catch (e) {
      console.error("AI Gen Error:", e);
      alert(t('ai_gen_fail') || "Не вдалося згенерувати тест.");
      startNewQuiz(topicKey);
    } finally {
      setAiLoading(false);
    }
  };

  const startNewQuiz = (quizTopic) => {
    const fullQuestionBank = STATIC_TESTS[quizTopic] || [];
    const shuffled = [...fullQuestionBank].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled.slice(0, QUESTIONS_PER_QUIZ));
    setIsAiMode(false);
    setCurrentQ(0); setScore(0); setSelected(null); setShowResult(false); setAiExplanation("");
  };

  useEffect(() => {
    startNewQuiz(topic);
  }, [topic, i18n.language]);

  function handleAnswer(index) {
    if (selected !== null) return;
    setSelected(index);
    if (index === activeQuestions[currentQ].answer) setScore(score + 1);
  }

  function nextQuestion() {
    if (currentQ + 1 < activeQuestions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAiExplanation("");
    } else {
      setShowResult(true);
    }
  }

  if (aiLoading && activeQuestions.length === 0) {
    return <div className="loader-container">🤖 {t('ai_loading_quiz')}</div>;
  }

  return (
    <div className="quiz-container">
      <h1>{t('tests_title')}</h1>

      <div className="mode-switcher">
        <button onClick={() => startNewQuiz(topic)} className={`mode-btn ${!isAiMode ? 'active' : ''}`}>
          📚 {t('static_mode')}
        </button>
        <button onClick={() => generateAiQuiz(topic)} className={`mode-btn ai ${isAiMode ? 'active' : ''}`} disabled={aiLoading}>
          ✨ {t('ai_mode')}
        </button>
      </div>

      <div className="topic-selector">
        {Object.keys(STATIC_TESTS).map(topicKey => (
          <button key={topicKey} onClick={() => setTopic(topicKey)} className={`topic-btn ${topic === topicKey ? 'active' : ''}`}>
            {t(topicKey).toUpperCase()}
          </button>
        ))}
      </div>

      <div className="quiz-card">
        {!showResult ? (
          <>
            <div className="quiz-header">
              <p>{t('question_label')} {currentQ + 1} {t('from_label')} {activeQuestions.length}</p>
              <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${((currentQ + 1) / activeQuestions.length) * 100}%` }}></div>
              </div>
            </div>
            
            <h2 className="question-text">
              {isAiMode ? activeQuestions[currentQ]?.question : t(activeQuestions[currentQ]?.question)}
            </h2>
            
            <div className="options-grid">
              {activeQuestions[currentQ]?.options?.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === activeQuestions[currentQ].answer;
                let statusClass = '';
                if (selected !== null) {
                  if (isCorrect) statusClass = 'correct';
                  else if (isSelected) statusClass = 'incorrect';
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)} className={`option-btn ${statusClass}`} disabled={selected !== null}>
                    {isAiMode ? opt : t(opt)}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="explanation-area">
                <div className="explanation">
                  <p><b>💡 {t('explanation_label')}:</b> {isAiMode ? activeQuestions[currentQ].explanation : t(activeQuestions[currentQ].explanation)}</p>
                </div>
                
                <button className="ai-ask-btn" onClick={() => getAiExplanation(
                    activeQuestions[currentQ].question, 
                    activeQuestions[currentQ].options[selected],
                    activeQuestions[currentQ].options[activeQuestions[currentQ].answer]
                  )} disabled={aiLoading}>
                  {aiLoading ? `🤖 ${t('ai_thinking')}...` : `🤖 ${t('ai_ask_btn')}`}
                </button>

                {aiExplanation && <div className="ai-response-box"><p>{aiExplanation}</p></div>}

                <button onClick={nextQuestion} className="next-btn-manual">
                  {currentQ + 1 === activeQuestions.length ? t('finish_btn') : t('next_btn')} →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="result-screen">
            <h2>{t('test_finished')}</h2>
            <p className="result-score">{t('your_result')}: <strong>{score}</strong> / <strong>{activeQuestions.length}</strong></p>
            <button onClick={() => startNewQuiz(topic)} className="restart-btn">{t('restart_btn')}</button>
          </div>
        )}
      </div>
    </div>
  );
}