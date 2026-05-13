import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; 

// --- Логічні операції ---
const AND = (a, b) => a & b;
const OR = (a, b) => a | b;
const NOT = (a) => a ^ 1;

// --- Парсер виразу ---
function parseExpr(expr, t) { // Додано t для перекладу помилок
  expr = expr.replace(/\s+/g, "");
  function parseOr(s) {
    let level = 0;
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i] === ")") level++;
      else if (s[i] === "(") level--;
      else if (level === 0 && s[i] === "∨") {
        return {
          type: "or",
          left: parseOr(s.slice(0, i)),
          right: parseAnd(s.slice(i + 1)),
        };
      }
    }
    return parseAnd(s);
  }
  function parseAnd(s) {
    let level = 0;
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i] === ")") level++;
      else if (s[i] === "(") level--;
      else if (level === 0 && s[i] === "∧") {
        return {
          type: "and",
          left: parseAnd(s.slice(0, i)),
          right: parseNot(s.slice(i + 1)),
        };
      }
    }
    return parseNot(s);
  }
  function parseNot(s) {
    if (s[0] === "¬") {
      return { type: "not", expr: parseNot(s.slice(1)) };
    }
    return parseAtom(s);
  }
  function parseAtom(s) {
    if (s[0] === "(" && s[s.length - 1] === ")") {
      return parseOr(s.slice(1, -1));
    }
    if (/^[a-z]$/.test(s)) {
      return { type: "var", name: s };
    }
    throw new Error((t ? t('logic_parse_error') : "Parsing error: ") + s);
  }
  return parseOr(expr);
}

// --- Обчислення виразу ---
function evalExpr(node, vars) {
  switch (node.type) {
    case "var":
      return vars[node.name] ?? 0;
    case "not":
      return NOT(evalExpr(node.expr, vars));
    case "and":
      return AND(evalExpr(node.left, vars), evalExpr(node.right, vars));
    case "or":
      return OR(evalExpr(node.left, vars), evalExpr(node.right, vars));
    default:
      return 0;
  }
}

// --- Отримання змінних ---
function getVars(node, set = new Set()) {
  if (node.type === "var") {
    set.add(node.name);
  } else if (node.type === "not") {
    getVars(node.expr, set);
  } else if (node.type === "and" || node.type === "or") {
    getVars(node.left, set);
    getVars(node.right, set);
  }
  return Array.from(set).sort();
}

// --- Генерація усіх комбінацій ---
function generateCombinations(vars) {
  const n = vars.length;
  const rows = [];
  const count = 1 << n;
  for (let i = 0; i < count; i++) {
    const assign = {};
    for (let j = 0; j < n; j++) {
      assign[vars[j]] = (i >> (n - j - 1)) & 1;
    }
    rows.push(assign);
  }
  return rows;
}

// --- Побудова СДНФ ---
function buildSDNF(vars, rows, values) {
  let terms = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 1) {
      let termParts = [];
      for (let v of vars) {
        termParts.push(rows[i][v] === 1 ? v : `¬${v}`);
      }
      terms.push(termParts.join(""));
    }
  }
  return terms.length > 0 ? terms.join(" ∨ ") : "0";
}

// --- Побудова СКНФ ---
function buildSKNF(vars, rows, values) {
  let clauses = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) {
      let clauseParts = [];
      for (let v of vars) {
        clauseParts.push(rows[i][v] === 0 ? v : `¬${v}`);
      }
      clauses.push("(" + clauseParts.join(" ∨ ") + ")");
    }
  }
  return clauses.length > 0 ? clauses.join(" ∧ ") : "1";
}

// --- Побудова полінома Жегалкіна ---
function buildZhegalkin(vars, values) {
  const n = vars.length;
  const size = 1 << n;
  const coef = values.slice();
  for (let i = 1; i < size; i++) {
    for (let j = size - 1; j >= i; j--) {
      coef[j] = coef[j] ^ coef[j - 1];
    }
  }
  let terms = [];
  for (let i = 0; i < size; i++) {
    if (coef[i] === 1) {
      if (i === 0) {
        terms.push("1");
      } else {
        let monom = [];
        for (let bit = 0; bit < n; bit++) {
          if ((i >> bit) & 1) {
            monom.push(vars[n - 1 - bit]);
          }
        }
        terms.push(monom.join("∧"));
      }
    }
  }
  return terms.length > 0 ? terms.join(" ⊕ ") : "0";
}

// --- Допоміжна функція підрахунку одиниць ---
function countOnes(x) {
  let count = 0;
  while (x) {
    count += x & 1;
    x >>= 1;
  }
  return count;
}

// --- Мінімізація КНФ ---
function minimizeCNF(vars, rows, values) {
  const n = vars.length;
  if (n === 0) return "";
  let zeroMinterms = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) zeroMinterms.push(i);
  }
  if (zeroMinterms.length === 0) return "1";
  if (zeroMinterms.length === (1 << n)) return "0";

  let groups = {};
  zeroMinterms.forEach((m) => {
    const ones = countOnes(m);
    if (!groups[ones]) groups[ones] = [];
    groups[ones].push({ bits: m, mask: 0, used: false });
  });

  let primeImplicants = [];
  while (true) {
    let nextGroups = {};
    let usedPairs = new Set();
    let anyCombined = false;
    const groupKeys = Object.keys(groups).map((x) => parseInt(x)).sort((a, b) => a - b);
    for (let i = 0; i < groupKeys.length - 1; i++) {
      const g1 = groups[groupKeys[i]];
      const g2 = groups[groupKeys[i + 1]];
      for (let a of g1) {
        for (let b of g2) {
          const diff = a.bits ^ b.bits;
          if (countOnes(diff) === 1 && a.mask === b.mask) {
            const newBits = a.bits & b.bits;
            const newMask = a.mask | diff;
            const key = newBits + ":" + newMask;
            if (!usedPairs.has(key)) {
              if (!nextGroups[groupKeys[i]]) nextGroups[groupKeys[i]] = [];
              nextGroups[groupKeys[i]].push({ bits: newBits, mask: newMask, used: false });
              usedPairs.add(key);
            }
            a.used = true; b.used = true; anyCombined = true;
          }
        }
      }
    }
    for (let group of Object.values(groups)) {
      for (let term of group) {
        if (!term.used) primeImplicants.push(term);
      }
    }
    if (!anyCombined) break;
    groups = nextGroups;
  }

  function termToClause(bits, mask) {
    let clause = [];
    for (let i = 0; i < n; i++) {
      const bit = (bits >> (n - i - 1)) & 1;
      const skip = (mask >> (n - i - 1)) & 1;
      if (!skip) {
        clause.push(bit === 0 ? vars[i] : `¬${vars[i]}`);
      }
    }
    return "(" + clause.join(" ∨ ") + ")";
  }
  return primeImplicants.map((t) => termToClause(t.bits, t.mask)).join(" ∧ ");
}

// --- Мінімізація ДНФ ---
function minimizeDNF(vars, rows, values) {
  const n = vars.length;
  if (n === 0) return "";
  let minterms = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 1) minterms.push(i);
  }
  if (minterms.length === 0) return "0";
  if (minterms.length === (1 << n)) return "1";

  let groups = {};
  minterms.forEach((m) => {
    const ones = countOnes(m);
    if (!groups[ones]) groups[ones] = [];
    groups[ones].push({ bits: m, mask: 0, used: false });
  });

  let primeImplicants = [];
  while (true) {
    let nextGroups = {};
    let usedPairs = new Set();
    let anyCombined = false;
    const groupKeys = Object.keys(groups).map((x) => parseInt(x)).sort((a, b) => a - b);
    for (let i = 0; i < groupKeys.length - 1; i++) {
      const g1 = groups[groupKeys[i]];
      const g2 = groups[groupKeys[i + 1]];
      for (let a of g1) {
        for (let b of g2) {
          const diff = a.bits ^ b.bits;
          if (countOnes(diff) === 1 && a.mask === b.mask) {
            const newBits = a.bits & b.bits;
            const newMask = a.mask | diff;
            const key = newBits + ":" + newMask;
            if (!usedPairs.has(key)) {
              if (!nextGroups[groupKeys[i]]) nextGroups[groupKeys[i]] = [];
              nextGroups[groupKeys[i]].push({ bits: newBits, mask: newMask, used: false });
              usedPairs.add(key);
            }
            a.used = true; b.used = true; anyCombined = true;
          }
        }
      }
    }
    for (let group of Object.values(groups)) {
      for (let term of group) {
        if (!term.used) primeImplicants.push(term);
      }
    }
    if (!anyCombined) break;
    groups = nextGroups;
  }

  function termToString(bits, mask) {
    let term = [];
    for (let i = 0; i < n; i++) {
      const bit = (bits >> (n - i - 1)) & 1;
      const skip = (mask >> (n - i - 1)) & 1;
      if (!skip) {
        term.push(bit === 1 ? vars[i] : `¬${vars[i]}`);
      }
    }
    return term.join("");
  }
  return primeImplicants.map((t) => termToString(t.bits, t.mask)).join(" ∨ ");
}

// --- Класи Поста ---
function postClasses(vars, rows, values) {
  const n = values.length;
  const T0 = values[0] === 0;
  const T1 = values[n - 1] === 1;

  let M = true;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let lessOrEqual = true;
      for (let v of vars) {
        if (rows[i][v] > rows[j][v]) lessOrEqual = false;
      }
      if (lessOrEqual && values[i] > values[j]) M = false;
    }
  }

  let S = true;
  for (let i = 0; i < n; i++) {
    if (values[i] === values[n - 1 - i]) {
      S = false;
      break;
    }
  }

  const zhegalkin = buildZhegalkin(vars, values);
  const linear = !zhegalkin.split("⊕").some((term) => term.trim().length > 1 && term.includes("∧"));

  return { T0, T1, M, S, L: linear };
}

// --- Головний компонент ---
export default function LogicCalculator() {
  const { t } = useTranslation();
  const [expr, setExpr] = useState("¬a∨b∧(a∨¬b∧c)");
  const [ast, setAst] = useState(null);
  const [vars, setVars] = useState([]);
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState([]);
  const [sdnf, setSdnf] = useState("");
  const [sknf, setSknf] = useState("");
  const [zhegalkin, setZhegalkin] = useState("");
  const [post, setPost] = useState({});
  const [error, setError] = useState(null);
  const [minDnf, setMinDnf] = useState("");
  const [minKnf, setMinKnf] = useState("");

  useEffect(() => {
    try {
      const tree = parseExpr(expr, t);
      setAst(tree);
      const variables = getVars(tree);
      setVars(variables);
      const combos = generateCombinations(variables);
      setRows(combos);
      const vals = combos.map((combo) => evalExpr(tree, combo));
      setValues(vals);
      setSdnf(buildSDNF(variables, combos, vals));
      setSknf(buildSKNF(variables, combos, vals));
      setZhegalkin(buildZhegalkin(variables, vals));
      setPost(postClasses(variables, combos, vals));
      setMinDnf(minimizeDNF(variables, combos, vals));
      setMinKnf(minimizeCNF(variables, combos, vals));
      setError(null);
    } catch (e) {
      setError(e.message);
      setAst(null);
      setVars([]); setRows([]); setValues([]);
      setSdnf(""); setSknf(""); setZhegalkin("");
      setPost({}); setMinDnf(""); setMinKnf("");
    }
  }, [expr, t]);

  // Стилі перенесено в об'єкт для зручності
  const styles = {
    container: { maxWidth: 900, margin: "auto", fontFamily: "'Segoe UI', sans-serif", color: "#222", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
    input: { width: "100%", fontSize: 20, padding: "8px 12px", borderRadius: 6, border: "2px solid #ddd", marginBottom: 20, boxSizing: "border-box" },
    table: { borderCollapse: "collapse", width: "100%", marginBottom: 20 },
    thtd: { border: "1px solid #ccc", padding: "8px 12px", textAlign: "center" },
    heading: { color: "#1a73e8", marginBottom: 10 },
    infoBox: { backgroundColor: "#e3f2fd", padding: 10, borderRadius: 8, marginBottom: 20, fontSize: 16, color: "#1a237e", whiteSpace: "pre-wrap", fontFamily: "monospace" }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ ...styles.heading, textAlign: "center" }}>
        {t('logic_calc_main_title')}
      </h1>

      <p>{t('logic_input_label')}</p>
      <input
        style={styles.input}
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder={t('logic_placeholder')}
      />

      {error && <div style={{ color: "red", fontWeight: "bold", marginBottom: 20 }}>{t('logic_error_prefix')}: {error}</div>}

      {!error && ast && (
        <>
          <h2 style={styles.heading}>{t('logic_variables')}: {vars.join(", ")}</h2>

          <h2 style={styles.heading}>{t('truth_table_title')}</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                {vars.map((v) => (
                  <th style={styles.thtd} key={v}>{v}</th>
                ))}
                <th style={styles.thtd}>f</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {vars.map((v) => (
                    <td style={styles.thtd} key={v}>{row[v]}</td>
                  ))}
                  <td style={{ ...styles.thtd, fontWeight: "bold", color: values[i] ? "#1a73e8" : "#e53935" }}>
                    {values[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={styles.heading}>{t('ddnf_title')}</h2>
          <pre style={styles.infoBox}>{sdnf}</pre>

          <h2 style={styles.heading}>{t('dknf_title')}</h2>
          <pre style={styles.infoBox}>{sknf}</pre>

          <h2 style={styles.heading}>{t('zhegalkin_title')}</h2>
          <pre style={styles.infoBox}>{zhegalkin}</pre>

          <h2 style={styles.heading}>{t('min_dnf_title')}</h2>
          <pre style={styles.infoBox}>{minDnf}</pre>

          <h2 style={styles.heading}>{t('min_knf_title')}</h2>
          <pre style={styles.infoBox}>{minKnf}</pre>

          <h2 style={styles.heading}>{t('post_classes_title')}</h2>
          <ul>
            <li>{t('post_t0')}: {post.T0 ? t('yes') : t('no')}</li>
            <li>{t('post_t1')}: {post.T1 ? t('yes') : t('no')}</li>
            <li>{t('post_m')}: {post.M ? t('yes') : t('no')}</li>
            <li>{t('post_s')}: {post.S ? t('yes') : t('no')}</li>
            <li>{t('post_l')}: {post.L ? t('yes') : t('no')}</li>
          </ul>
        </>
      )}
    </div>
  );
}