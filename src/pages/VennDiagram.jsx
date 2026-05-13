import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as venn from "venn.js";
import * as d3 from "d3";
import { useTranslation } from "react-i18next"; // Додано для перекладу
import "./VennDiagram.css";

// --- Утиліти для роботи з множинами (без змін) ---
const parseSet = (text) => {
  return new Set(
    text
      .split(/[, ]+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .map((x) => {
        const n = Number(x);
        return isNaN(n) ? x : n;
      })
  );
};

const setUnion = (setA, setB) => new Set([...setA, ...setB]);
const setIntersection = (setA, setB) => new Set([...setA].filter((x) => setB.has(x)));
const setDifference = (setA, setB) => new Set([...setA].filter((x) => !setB.has(x)));
const setSymDifference = (setA, setB) =>
  new Set([
    ...[...setA].filter((x) => !setB.has(x)),
    ...[...setB].filter((x) => !setA.has(x)),
  ]);

// --- Головний компонент ---
export default function VennDiagram() {
  const { t } = useTranslation(); // Хук перекладу
  const [inputA, setInputA] = useState("1, 2, 3, 4, 5");
  const [inputB, setInputB] = useState("4, 5, 6, 7");
  const [inputC, setInputC] = useState("5, 7, 8, 9");
  const [expression, setExpression] = useState("setIntersection(A, B)");
  const [error, setError] = useState("");

  const diagramRef = useRef(null);
  const expressionInputRef = useRef(null);

  const A = useMemo(() => parseSet(inputA), [inputA]);
  const B = useMemo(() => parseSet(inputB), [inputB]);
  const C = useMemo(() => parseSet(inputC), [inputC]);

  const evaluateExpression = useCallback((expr) => {
    if (!expr) {
      setError("");
      return new Set();
    }
    try {
      const fn = new Function(
        "setIntersection", "setUnion", "setDifference", "setSymDifference",
        "A", "B", "C",
        `return ${expr}`
      );
      const result = fn(
        setIntersection, setUnion, setDifference, setSymDifference,
        A, B, C
      );
      if (!(result instanceof Set)) {
        throw new Error(t('venn_error_not_set')); // Переклад помилки
      }
      setError("");
      return result;
    } catch (e) {
      console.error("Evaluation error:", e);
      setError(t('venn_error_syntax')); // Переклад помилки
      return new Set();
    }
  }, [A, B, C, t]);

  const resultSet = useMemo(() => evaluateExpression(expression), [expression, evaluateExpression]);

  // Дані для розмірів діаграми
  const setsData = useMemo(() => [
    { sets: ["A"], size: A.size, data: A },
    { sets: ["B"], size: B.size, data: B },
    { sets: ["C"], size: C.size, data: C },
    { sets: ["A", "B"], size: setIntersection(A, B).size, data: setIntersection(A, B) },
    { sets: ["A", "C"], size: setIntersection(A, C).size, data: setIntersection(A, C) },
    { sets: ["B", "C"], size: setIntersection(B, C).size, data: setIntersection(B, C) },
    { sets: ["A", "B", "C"], size: setIntersection(setIntersection(A, B), C).size, data: setIntersection(setIntersection(A, B), C) },
  ], [A, B, C]);

  // Обчислюємо елементи для кожної з 7 унікальних областей
  const regionElements = useMemo(() => {
    const a_only = setDifference(A, setUnion(B, C));
    const b_only = setDifference(B, setUnion(A, C));
    const c_only = setDifference(C, setUnion(A, B));
    const ab_only = setDifference(setIntersection(A, B), C);
    const ac_only = setDifference(setIntersection(A, C), B);
    const bc_only = setDifference(setIntersection(B, C), A);
    const abc = setIntersection(setIntersection(A, B), C);

    return {
      'A': [...a_only].join(', '),
      'B': [...b_only].join(', '),
      'C': [...c_only].join(', '),
      'A_B': [...ab_only].join(', '),
      'A_C': [...ac_only].join(', '),
      'B_C': [...bc_only].join(', '),
      'A_B_C': [...abc].join(', '),
    };
  }, [A, B, C]);

  // Ефект для відмальовки діаграми та підписів
  useEffect(() => {
    const chart = venn.VennDiagram().width(500).height(450);
    const div = d3.select(diagramRef.current);
    div.selectAll("*").remove();
    div.datum(setsData).call(chart);
    
    // Стилізація
    div.selectAll(".venn-circle path").style("fill-opacity", .2);
    div.selectAll(".venn-area").each(function(d) {
        d3.select(this).attr("data-venn-sets", d.sets.join("_"));
    });

    // Замінюємо стандартні підписи розмірів на наші елементи
    div.selectAll(".venn-area text")
        .attr("class", "venn-element-label") 
        .text(d => regionElements[d.sets.join('_')]) 
        .each(function() { 
          const text = d3.select(this);
          const words = text.text().split(/\s*,\s*/).join(' '); 
          if (words.length > 10) { 
            text.style("font-size", "11px");
          }
        });

  }, [setsData, regionElements]);
  
  // Ефект для підсвічування результату на діаграмі
  useEffect(() => {
    if (!diagramRef.current) return;
    const div = d3.select(diagramRef.current);
    div.selectAll("path").classed("highlighted", false);
    if (resultSet.size === 0) return;
    const areas = {
        A_B_C: setIntersection(setIntersection(A, B), C),
        A_B: setDifference(setIntersection(A, B), C),
        A_C: setDifference(setIntersection(A, C), B),
        B_C: setDifference(setIntersection(B, C), A),
        A: setDifference(setDifference(A, B), C),
        B: setDifference(setDifference(B, A), C),
        C: setDifference(setDifference(C, A), B),
    };
    for (const key in areas) {
        if (setIntersection(resultSet, areas[key]).size > 0) {
            div.select(`[data-venn-sets='${key}'] path`).classed("highlighted", true);
        }
    }
  }, [resultSet, A, B, C]);

  const insertToExpression = (text) => {
    if (!expressionInputRef.current) return;
    const { selectionStart, selectionEnd, value } = expressionInputRef.current;
    const newExpression = value.substring(0, selectionStart) + text + value.substring(selectionEnd);
    setExpression(newExpression);
    expressionInputRef.current.focus();
  };
  
  const buttons = [
    "A", "B", "C", "(", ")", ",", " ",
    "setIntersection(", "setUnion(", "setDifference(", "setSymDifference("
  ];

  return (
    <div className="venn-container">
      <h1>🧮 {t('venn_calc_title')}</h1>

      <div className="sets-input-panel">
        <div className="set-input">
          <label htmlFor="setA">{t('venn_set')} A</label>
          <input id="setA" type="text" value={inputA} onChange={(e) => setInputA(e.target.value)} />
        </div>
        <div className="set-input">
          <label htmlFor="setB">{t('venn_set')} B</label>
          <input id="setB" type="text" value={inputB} onChange={(e) => setInputB(e.target.value)} />
        </div>
        <div className="set-input">
          <label htmlFor="setC">{t('venn_set')} C</label>
          <input id="setC" type="text" value={inputC} onChange={(e) => setInputC(e.target.value)} />
        </div>
      </div>

      <div className="expression-panel">
        <label htmlFor="expression">{t('venn_expression_label')}</label>
        <input 
          id="expression" 
          type="text" 
          ref={expressionInputRef} 
          value={expression} 
          onChange={(e) => setExpression(e.target.value)} 
          className={error ? "input-error" : ""}
        />
        {error && <p className="error-message">{error}</p>}
        <div className="button-panel">
          {buttons.map(btn => {
            // Отримуємо ключ перекладу (прибираємо дужку для функцій)
            const translationKey = `venn_btn_${btn.replace('(', '')}`;
            // Перевіряємо, чи існує переклад для цього ключа
            const label = t(translationKey);

            return (
              <button key={btn} onClick={() => insertToExpression(btn)}>
                {/* Якщо переклад знайдено (результат не дорівнює ключу), виводимо його. 
                    Інакше виводимо саму кнопку (A, B, C, тощо) */}
                {label !== translationKey ? label : btn}
              </button>
            );
          })}
          <button onClick={() => setExpression("")} className="clear-btn">{t('venn_btn_clear')}</button>
        </div>
      </div>
      
      <div className="results-panel">
        <div className="diagram" ref={diagramRef} />
      </div>

      <div className="result-set">
          <h3>{t('venn_result_label')}:</h3>
          <p className="result-text">{`{ ${[...resultSet].join(", ")} }`}</p>
      </div>
    </div>
  );
}